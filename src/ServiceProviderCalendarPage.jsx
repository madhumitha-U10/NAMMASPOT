import {useEffect,useMemo,useState} from "react";
import {ArrowLeft,CalendarDays,ChevronLeft,ChevronRight,Clock,CheckCircle,Phone,MessageCircle,MapPin,Save,Settings,CalendarCheck,Users,AlertCircle,LoaderCircle,Plus,Lock,Unlock} from "lucide-react";
import {getMySeller} from "./lib/api";
import {getMyMicrosite,saveMicrosite,saveHours,saveSpecialDates,getMyServiceAppointments,updateServiceAppointmentStatus,sellerPublicUrl} from "./lib/microsite";
import {supabase} from "./lib/supabase";

const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const pad=(n)=>String(n).padStart(2,"0");
const dateKey=(date)=>date.getFullYear()+"-"+pad(date.getMonth()+1)+"-"+pad(date.getDate());
const firstOfMonth=(date)=>new Date(date.getFullYear(),date.getMonth(),1);
const timeLabel=(value)=>{const [h,m]=String(value||"").split(":").map(Number);return new Intl.DateTimeFormat("en-IN",{hour:"numeric",minute:"2-digit"}).format(new Date(2000,0,1,h||0,m||0))};
const dateLabel=(value)=>new Intl.DateTimeFormat("en-IN",{weekday:"long",day:"numeric",month:"long"}).format(new Date(value+"T12:00:00"));
const statusLabel=(status)=>({pending:"New request",confirmed:"Confirmed",declined:"Declined",cancelled:"Cancelled",completed:"Completed"}[status]||status);
const emptyHours=()=>DAYS.map((_,i)=>({day_of_week:i,is_open:false,ranges:[]}));

export default function ServiceProviderCalendarPage({go}){
  const [seller,setSeller]=useState(null);
  const [settings,setSettings]=useState({business_type:"",services:"",experience:"",area_served:"",appointment_duration_minutes:60});
  const [hours,setHours]=useState(emptyHours());
  const [specials,setSpecials]=useState([]);
  const [appointments,setAppointments]=useState([]);
  const [month,setMonth]=useState(firstOfMonth(new Date()));
  const [selectedDate,setSelectedDate]=useState(dateKey(new Date()));
  const [tab,setTab]=useState("calendar");
  const [state,setState]=useState({loading:true,saving:false,error:"",notice:""});
  const [busyId,setBusyId]=useState("");

  const refreshAppointments=async(sellerId=seller?.id)=>{
    if(!sellerId)return;
    const today=new Date(),from=dateKey(new Date(today.getFullYear(),today.getMonth(),today.getDate()-30)),to=dateKey(new Date(today.getFullYear(),today.getMonth(),today.getDate()+90));
    const rows=await getMyServiceAppointments(sellerId,from,to);
    setAppointments(rows);
  };

  useEffect(()=>{
    let active=true;
    (async()=>{
      try{
        const profile=await getMySeller();
        if(!profile?.id)throw new Error("Sign in to manage your service calendar.");
        const [microsite,rows]=await Promise.all([
          getMyMicrosite(profile.id),
          getMyServiceAppointments(profile.id,dateKey(new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()-30)),dateKey(new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()+90)))
        ]);
        if(!active)return;
        setSeller(profile);
        setSettings(s=>({...s,...(microsite.settings||{})}));
        setHours(DAYS.map((_,i)=>microsite.hours?.find(h=>Number(h.day_of_week)===i)||{day_of_week:i,is_open:false,ranges:[]}));
        setSpecials(microsite.specialDates||[]);
        setAppointments(rows||[]);
        setState({loading:false,saving:false,error:"",notice:""});
      }catch(error){if(active)setState({loading:false,saving:false,error:error?.message||"Could not load your service calendar.",notice:""});}
    })();
    return()=>{active=false};
  },[]);

  useEffect(()=>{
    if(!seller?.id||!supabase)return;
    const channel=supabase.channel("service-appointments-"+seller.id)
      .on("postgres_changes",{event:"*",schema:"public",table:"service_appointments",filter:"seller_id=eq."+seller.id},()=>refreshAppointments(seller.id))
      .subscribe();
    const fallback=window.setInterval(()=>refreshAppointments(seller.id).catch(()=>{}),45000);
    return()=>{window.clearInterval(fallback);supabase.removeChannel(channel);};
  },[seller?.id]);

  const services=String(settings.services||"").split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean);
  const pendingCount=appointments.filter(a=>a.status==="pending").length;
  const upcomingCount=appointments.filter(a=>a.status==="confirmed"&&a.appointment_date>=dateKey(new Date())).length;
  const monthCells=useMemo(()=>{
    const first=firstOfMonth(month),offset=first.getDay(),count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    return Array.from({length:Math.ceil((offset+count)/7)*7},(_,i)=>{const d=i-offset+1;return d<1||d>count?null:new Date(month.getFullYear(),month.getMonth(),d)});
  },[month]);
  const selectedSpecial=specials.find(x=>x.special_date===selectedDate);
  const dayAppointments=appointments.filter(a=>a.appointment_date===selectedDate).sort((a,b)=>String(a.start_time).localeCompare(String(b.start_time)));
  const isOpenDate=(date)=>{
    const key=dateKey(date),special=specials.find(x=>x.special_date===key);
    if(special?.is_closed)return false;
    if(special&&!special.is_closed&&special.ranges?.length)return true;
    const row=hours.find(x=>Number(x.day_of_week)===date.getDay());
    return Boolean(row?.is_open&&row.ranges?.length);
  };
  const updateHour=(day,patch)=>{
    setHours(current=>current.map(row=>Number(row.day_of_week)===day?{...row,...patch}:row));
  };
  const setDayTime=(day,key,value)=>{
    const row=hours.find(x=>Number(x.day_of_week)===day)||{day_of_week:day,is_open:false,ranges:[]};
    const range=row.ranges?.[0]||{open:"09:00",close:"17:00"};
    updateHour(day,{ranges:[{...range,[key]:value}]});
  };
  const saveAll=async()=>{
    if(!seller)return;
    setState(s=>({...s,saving:true,error:"",notice:""}));
    try{
      const invalidDay=hours.find(row=>row.is_open&&(!row.ranges?.[0]?.open||!row.ranges?.[0]?.close||row.ranges[0].close<=row.ranges[0].open));
      if(invalidDay)throw new Error("Check the opening and closing times for "+DAYS[Number(invalidDay.day_of_week)]+". Closing time must be later than opening time.");
      const clean={...settings,appointment_duration_minutes:Number(settings.appointment_duration_minutes)||60};
      await saveMicrosite(seller.id,clean);
      await saveHours(seller.id,hours);
      await saveSpecialDates(seller.id,specials);
      setState(s=>({...s,saving:false,notice:"Your services and availability have been saved."}));
      await refreshAppointments(seller.id);
    }catch(error){setState(s=>({...s,saving:false,error:error?.message||"Could not save your changes.",notice:""}));}
  };
  const updateStatus=async(id,status)=>{
    setBusyId(id);setState(s=>({...s,error:"",notice:""}));
    try{
      await updateServiceAppointmentStatus(id,status);
      setAppointments(rows=>rows.map(row=>row.id===id?{...row,status}:row));
      setState(s=>({...s,notice:"Appointment updated."}));
    }catch(error){setState(s=>({...s,error:error?.message||"Could not update this appointment."}));}
    finally{setBusyId("");}
  };
  const toggleBlockDate=()=>{
    const existing=specials.find(x=>x.special_date===selectedDate);
    if(existing?.is_closed)setSpecials(rows=>rows.filter(x=>x.special_date!==selectedDate));
    else if(existing)setSpecials(rows=>rows.map(x=>x.special_date===selectedDate?{...x,is_closed:true,ranges:[]}:x));
    else setSpecials(rows=>[...rows,{special_date:selectedDate,label:"Unavailable",is_closed:true,ranges:[]}]);
  };
  const phone=(value)=>{const raw=String(value||"").replace(/\\D/g,"");return raw.length===10?"91"+raw:raw.startsWith("0")&&raw.length===11?"91"+raw.slice(1):raw;};

  if(state.loading)return <section className="service-calendar-page"><p className="ns-calendar-loading"><LoaderCircle size={18}/> Loading your calendar…</p></section>;
  if(!seller)return <section className="service-calendar-page"><div className="inline-error">{state.error||"Seller profile not found."}</div><button className="secondary-button" onClick={()=>go("/dashboard")}><ArrowLeft size={16}/> Dashboard</button></section>;

  return <section className="service-calendar-page">
    <header className="ns-provider-dashboard-head">
      <div><span className="ns-provider-kicker">SERVICE PROVIDER SPACE</span><h1>Your appointment calendar</h1><p>Manage availability and customer requests from one simple place.</p></div>
      <a className="secondary-button" href={sellerPublicUrl(seller.slug)} target="_blank" rel="noreferrer">Preview public page <CalendarDays size={15}/></a>
    </header>
    <div className="ns-provider-metrics">
      <div><span>Needs your reply</span><strong>{pendingCount}</strong><small>New appointment requests</small></div>
      <div><span>Confirmed</span><strong>{upcomingCount}</strong><small>Upcoming appointments</small></div>
      <div><span>Services listed</span><strong>{services.length}</strong><small>Visible on your NammaSpot page</small></div>
    </div>
    <nav className="ns-provider-tabs" aria-label="Service calendar sections">
      {[["calendar","Appointments"],["settings","Services & hours"]].map(([key,label])=><button type="button" key={key} className={tab===key?"active":""} onClick={()=>setTab(key)}>{key==="calendar"?<CalendarDays size={16}/>:<Settings size={16}/>} {label}</button>)}
    </nav>

    {tab==="calendar"&&<section className="ns-provider-calendar-workspace">
      <div className="ns-provider-calendar-panel">
        <div className="ns-provider-month-head"><div><span className="ns-provider-kicker">YOUR SCHEDULE</span><h2>{new Intl.DateTimeFormat("en-IN",{month:"long",year:"numeric"}).format(month)}</h2></div><div><button type="button" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))} aria-label="Previous month"><ChevronLeft size={18}/></button><button type="button" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} aria-label="Next month"><ChevronRight size={18}/></button></div></div>
        <div className="ns-provider-weekdays">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><span key={d}>{d}</span>)}</div>
        <div className="ns-provider-days">{monthCells.map((date,index)=>{
          if(!date)return <span key={"empty-"+index}/>;
          const key=dateKey(date),has=appointments.some(a=>a.appointment_date===key),open=isOpenDate(date),selected=selectedDate===key;
          return <button type="button" key={key} className={(selected?"selected ":"")+(open?"open ":"")+(has?"has-appointments":"")} onClick={()=>setSelectedDate(key)} aria-pressed={selected} aria-label={key+(has?", has appointments":"")}>
            <span>{date.getDate()}</span>{has&&<i/>}
          </button>;
        })}</div>
        <div className="ns-provider-calendar-legend"><span><i className="legend-open"/> Available hours</span><span><i className="legend-booked"/> Has appointments</span></div>
      </div>
      <div className="ns-provider-day-panel">
        <div className="ns-provider-day-heading"><div><span className="ns-provider-kicker">DAY VIEW</span><h2>{dateLabel(selectedDate)}</h2><p>{isOpenDate(new Date(selectedDate+"T12:00:00"))?"Availability is open":"No regular availability"}</p></div>
          <button type="button" className={selectedSpecial?.is_closed?"ns-day-unblock":"ns-day-block"} onClick={toggleBlockDate}>{selectedSpecial?.is_closed?<Unlock size={15}/>:<Lock size={15}/>} {selectedSpecial?.is_closed?"Unblock date":"Block date"}</button>
        </div>
        {dayAppointments.length? <div className="ns-provider-appointment-list">{dayAppointments.map(item=>{
          const digits=phone(item.customer_contact),wa=digits?"https://wa.me/"+digits+"?text="+encodeURIComponent("Hi "+item.customer_name+", your "+item.service_name+" appointment request with "+seller.business_name+" on "+dateLabel(item.appointment_date)+" at "+timeLabel(item.start_time)+"."):null;
          return <article className="ns-provider-appointment" key={item.id}>
            <div className="ns-provider-appointment-time"><strong>{timeLabel(item.start_time)}</strong><small>{timeLabel(item.end_time)}</small></div>
            <div className="ns-provider-appointment-details"><div className="ns-provider-appointment-top"><strong>{item.service_name}</strong><span className={"ns-appointment-status status-"+item.status}>{statusLabel(item.status)}</span></div><p>{item.customer_name} · {item.customer_contact}</p>{item.customer_note&&<small>{item.customer_note}</small>}<div className="ns-provider-contact-actions"><a href={"tel:"+item.customer_contact}><Phone size={14}/> Call</a>{wa&&<a href={wa} target="_blank" rel="noreferrer"><MessageCircle size={14}/> WhatsApp</a>}</div>
              {item.status==="pending"&&<div className="ns-provider-request-actions"><button type="button" disabled={busyId===item.id} onClick={()=>updateStatus(item.id,"confirmed")}><CheckCircle size={15}/> Confirm</button><button type="button" disabled={busyId===item.id} onClick={()=>updateStatus(item.id,"declined")}>Decline</button></div>}
              {item.status==="confirmed"&&<div className="ns-provider-request-actions"><button type="button" disabled={busyId===item.id} onClick={()=>updateStatus(item.id,"completed")}><CheckCircle size={15}/> Mark completed</button></div>}
            </div>
          </article>;
        })}</div>:<div className="ns-provider-empty-day"><CalendarCheck size={25}/><strong>No appointments for this day</strong><span>New customer requests will appear here.</span></div>}
      </div>
    </section>}

    {tab==="settings"&&<section className="ns-provider-settings-card">
      <div className="ns-provider-section-heading"><span className="ns-provider-kicker">YOUR OFFERINGS</span><h2>Make it easy to understand what you do</h2><p>Customers will see these services and choose one before requesting an appointment.</p></div>
      <label>Services you offer<textarea rows={5} maxLength={600} value={settings.services||""} onChange={e=>setSettings({...settings,services:e.target.value})} placeholder={"One service per line\nBridal makeup\nParty makeup\nMehendi design"}/><small>Keep each service name short and clear. One service per line works best.</small></label>
      <div className="ns-provider-form-grid"><label>Business / service type<input maxLength={120} value={settings.business_type||""} onChange={e=>setSettings({...settings,business_type:e.target.value})} placeholder="Example: Beauty professional"/></label><label>Experience<input maxLength={160} value={settings.experience||""} onChange={e=>setSettings({...settings,experience:e.target.value})} placeholder="Example: 3 years"/></label><label>Area you serve<input maxLength={180} value={settings.area_served||""} onChange={e=>setSettings({...settings,area_served:e.target.value})} placeholder="Example: Anna Nagar and nearby areas"/></label><label>Appointment length<select value={String(settings.appointment_duration_minutes||60)} onChange={e=>setSettings({...settings,appointment_duration_minutes:Number(e.target.value)})}>{[30,45,60,90,120].map(n=><option value={n} key={n}>{n} minutes</option>)}</select><small>Each appointment reserves this much time.</small></label></div>
      <div className="ns-provider-preview-note"><CheckCircle size={17}/> Your services appear on your public NammaSpot page with a booking calendar.</div>
    </section>}

    {tab==="settings"&&<section className="ns-provider-settings-card">
      <div className="ns-provider-section-heading"><span className="ns-provider-kicker">WEEKLY AVAILABILITY</span><h2>When can customers book you?</h2><p>Set your usual working hours once. You can block individual dates from the calendar whenever plans change.</p></div>
      <div className="ns-provider-hours-list">{DAYS.map((day,index)=>{
        const row=hours.find(h=>Number(h.day_of_week)===index)||{day_of_week:index,is_open:false,ranges:[]},range=row.ranges?.[0]||{open:"09:00",close:"17:00"};
        return <div className={"ns-provider-hours-row"+(row.is_open?" is-open":"")} key={day}>
          <label className="ns-provider-day-toggle"><input type="checkbox" checked={Boolean(row.is_open)} onChange={e=>updateHour(index,{is_open:e.target.checked,ranges:e.target.checked?(row.ranges?.length?row.ranges:[{open:"09:00",close:"17:00"}]):[]})}/><span>{day}</span></label>
          {row.is_open?<div className="ns-provider-time-fields"><label>From<input type="time" value={range.open||"09:00"} onChange={e=>setDayTime(index,"open",e.target.value)}/></label><span>to</span><label>Until<input type="time" value={range.close||"17:00"} onChange={e=>setDayTime(index,"close",e.target.value)}/></label></div>:<span className="ns-provider-closed-label">Unavailable</span>}
        </div>;
      })}</div>
      <p className="ns-provider-preview-note"><Lock size={16}/> Dates you block on the Calendar tab will not accept new appointment requests.</p>
    </section>}

    {state.error&&<div className="inline-error" role="alert"><AlertCircle size={16}/>{state.error}</div>}
    {state.notice&&<div className="form-status" role="status"><CheckCircle size={17}/>{state.notice}</div>}
    {tab==="settings"&&<div className="ns-provider-save-bar"><span>Save your services and working hours when you're done.</span><button type="button" onClick={saveAll} disabled={state.saving}><Save size={16}/>{state.saving?"Saving…":"Save changes"}</button></div>}
  </section>;
}
