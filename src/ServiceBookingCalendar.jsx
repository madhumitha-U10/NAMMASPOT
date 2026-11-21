import {useEffect,useMemo,useState} from "react";
import {CalendarDays,ChevronLeft,ChevronRight,Clock,CheckCircle,MessageCircle,ArrowRight,LoaderCircle} from "lucide-react";
import {createServiceAppointment,getPublicServiceCalendar,getPublicServiceSlots} from "./lib/microsite";

const pad=(n)=>String(n).padStart(2,"0");
const dateKey=(date)=>date.getFullYear()+"-"+pad(date.getMonth()+1)+"-"+pad(date.getDate());
const firstOfMonth=(date)=>new Date(date.getFullYear(),date.getMonth(),1);
const monthLabel=(date)=>new Intl.DateTimeFormat("en-IN",{month:"long",year:"numeric"}).format(date);
const timeLabel=(value)=>{const [h,m]=String(value||"").split(":").map(Number);const d=new Date(2000,0,1,h||0,m||0);return new Intl.DateTimeFormat("en-IN",{hour:"numeric",minute:"2-digit"}).format(d)};
const prettyDate=(value)=>new Intl.DateTimeFormat("en-IN",{weekday:"long",day:"numeric",month:"long"}).format(new Date(value+"T12:00:00"));

export default function ServiceBookingCalendar({seller,serviceItems=[]}){
  const today=new Date();
  const [month,setMonth]=useState(firstOfMonth(today));
  const [available,setAvailable]=useState({});
  const [calendarLoading,setCalendarLoading]=useState(true);
  const [calendarError,setCalendarError]=useState("");
  const [selectedDate,setSelectedDate]=useState("");
  const [slots,setSlots]=useState([]);
  const [slotsLoading,setSlotsLoading]=useState(false);
  const [selectedSlot,setSelectedSlot]=useState("");
  const [service,setService]=useState(serviceItems[0]||"");
  const [form,setForm]=useState({customer_name:"",customer_contact:"",customer_note:""});
  const [state,setState]=useState({saving:false,error:"",success:false,appointmentId:""});

  useEffect(()=>{if(!serviceItems.includes(service))setService(serviceItems[0]||"");},[serviceItems.join("|")]);

  useEffect(()=>{
    let active=true;
    const from=dateKey(firstOfMonth(month));
    const last=new Date(month.getFullYear(),month.getMonth()+1,0);
    const to=dateKey(last);
    setCalendarLoading(true);setCalendarError("");
    getPublicServiceCalendar(seller.id,from,to).then(rows=>{
      if(!active)return;
      const map={};(rows||[]).forEach(row=>{map[String(row.available_date).slice(0,10)]=Number(row.available_slots)||0});
      setAvailable(map);
    }).catch(error=>active&&setCalendarError(error?.message||"Could not load available dates. Please try again."))
      .finally(()=>active&&setCalendarLoading(false));
    return()=>{active=false};
  },[seller.id,month.getFullYear(),month.getMonth()]);

  const cells=useMemo(()=>{
    const first=firstOfMonth(month),offset=first.getDay(),count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    return Array.from({length:Math.ceil((offset+count)/7)*7},(_,index)=>{
      const day=index-offset+1;
      return day<1||day>count?null:new Date(month.getFullYear(),month.getMonth(),day);
    });
  },[month]);
  const currentMonth=firstOfMonth(today);
  const maxMonth=firstOfMonth(new Date(today.getFullYear(),today.getMonth()+2,1));
  const canGoBack=month.getTime()>currentMonth.getTime();
  const canGoForward=month.getTime()<maxMonth.getTime();

  const chooseDate=async(value)=>{
    setSelectedDate(value);setSelectedSlot("");setSlots([]);setState({saving:false,error:"",success:false,appointmentId:""});
    setSlotsLoading(true);
    try{setSlots(await getPublicServiceSlots(seller.id,value));}
    catch(error){setState(s=>({...s,error:error?.message||"Could not load times for this date."}));}
    finally{setSlotsLoading(false);}
  };

  const submit=async(event)=>{
    event.preventDefault();
    if(!selectedDate||!selectedSlot||!service){setState(s=>({...s,error:"Choose a service, date and time first."}));return;}
    setState({saving:true,error:"",success:false,appointmentId:""});
    try{
      const result=await createServiceAppointment({seller_id:seller.id,service_name:service,appointment_date:selectedDate,start_time:selectedSlot,customer_name:form.customer_name,customer_contact:form.customer_contact,customer_note:form.customer_note});
      setState({saving:false,error:"",success:true,appointmentId:result.id});
      const updated=await getPublicServiceSlots(seller.id,selectedDate);
      setSlots(updated);
    }catch(error){setState({saving:false,error:error?.message||"Could not send your appointment request. Please choose another time.",success:false,appointmentId:""});try{setSlots(await getPublicServiceSlots(seller.id,selectedDate));}catch{}}
  };

  const phone=String(seller.whatsapp_phone||"").replace(/\\D/g,"");
  const whatsappNumber=phone.length===10?"91"+phone:phone.startsWith("0")&&phone.length===11?"91"+phone.slice(1):phone;
  const whatsappMessage="Hi "+(seller.business_name||"there")+", I have sent an appointment request on NammaSpot for "+service+" on "+(selectedDate?prettyDate(selectedDate):"")+" at "+(selectedSlot?timeLabel(selectedSlot):"the selected time")+". Please confirm when convenient.";
  const whatsappUrl=whatsappNumber?"https://wa.me/"+whatsappNumber+"?text="+encodeURIComponent(whatsappMessage):"";

  return <section className="ns-booking-card">
    <div className="ns-booking-heading">
      <div><span className="ns-booking-kicker">APPOINTMENTS</span><h2>Choose a time that works for you</h2><p>See available dates, select a time and send your request. The provider will confirm your appointment.</p></div>
      <span className="ns-booking-heading-icon"><CalendarDays size={23}/></span>
    </div>
    {state.success?<div className="ns-booking-success" role="status">
      <span><CheckCircle size={25}/></span><div><strong>Request sent successfully</strong><p>Your appointment request is with {seller.business_name}. It is pending confirmation.</p><small>{service} · {prettyDate(selectedDate)}</small></div>
      {whatsappUrl&&<a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={16}/> Message provider</a>}
      <button type="button" onClick={()=>{setState({saving:false,error:"",success:false,appointmentId:""});setSelectedDate("");setSelectedSlot("");setSlots([]);}}>Book another time</button>
    </div>:<>
      {serviceItems.length?<label className="ns-booking-service-label">What service do you need?
        <select value={service} onChange={e=>{setService(e.target.value);setSelectedSlot("");setState({saving:false,error:"",success:false,appointmentId:""});}}>{serviceItems.map(item=><option key={item} value={item}>{item}</option>)}</select>
      </label>:<div className="ns-booking-setup-note"><strong>Online appointments are not open yet.</strong><span>This provider is setting up their services and availability. You can contact them directly using the WhatsApp or call options above.</span></div>}
      <div className="ns-booking-layout">
        <div className="ns-booking-calendar-panel">
          <div className="ns-booking-month-head"><button type="button" disabled={!canGoBack} onClick={()=>{setMonth(new Date(month.getFullYear(),month.getMonth()-1,1));setSelectedDate("");setSelectedSlot("");}} aria-label="Previous month"><ChevronLeft size={19}/></button><strong>{monthLabel(month)}</strong><button type="button" disabled={!canGoForward} onClick={()=>{setMonth(new Date(month.getFullYear(),month.getMonth()+1,1));setSelectedDate("");setSelectedSlot("");}} aria-label="Next month"><ChevronRight size={19}/></button></div>
          <div className="ns-booking-weekdays">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day=><span key={day}>{day}</span>)}</div>
          <div className="ns-booking-days">{cells.map((date,index)=>{
            if(!date)return <span className="ns-booking-day-empty" key={"empty-"+index}/>;
            const key=dateKey(date),count=available[key]||0,enabled=count>0,selected=selectedDate===key;
            return <button type="button" key={key} disabled={!enabled||calendarLoading} className={(enabled?"available ":"")+(selected?"selected":"")} onClick={()=>chooseDate(key)} aria-pressed={selected} aria-label={key+(enabled?", "+count+" available times":", unavailable")}>
              <span>{date.getDate()}</span>{enabled&&<i>{count}</i>}
            </button>;
          })}</div>
          <div className="ns-booking-legend"><span><i className="available-dot"/> Available</span><span><i className="unavailable-dot"/> Unavailable</span></div>
          {calendarLoading&&<p className="ns-booking-muted"><LoaderCircle size={14}/> Checking dates…</p>}
          {!calendarLoading&&!calendarError&&!Object.keys(available).length&&<p className="ns-booking-empty">This provider has not opened any appointment dates yet. Please contact them directly.</p>}
          {calendarError&&<p className="ns-booking-error" role="alert">{calendarError}</p>}
        </div>
        <div className="ns-booking-slot-panel">
          <div className="ns-booking-slot-title"><strong>{selectedDate?prettyDate(selectedDate):"Select a date"}</strong><small>{selectedDate?"Available appointment times":"Choose a highlighted date on the calendar"}</small></div>
          {slotsLoading?<p className="ns-booking-muted"><LoaderCircle size={15}/> Finding available times…</p>:selectedDate&&!slots.length?<p className="ns-booking-empty">No times are available on this date. Please choose another day.</p>:selectedDate?<div className="ns-booking-slots">{slots.map(slot=><button type="button" key={slot.start_time} className={selectedSlot===slot.start_time?"selected":""} onClick={()=>setSelectedSlot(slot.start_time)}><Clock size={14}/>{timeLabel(slot.start_time)}</button>)}</div>:<div className="ns-booking-empty ns-booking-empty-icon"><CalendarDays size={26}/><span>Your available times will appear here.</span></div>}
        </div>
      </div>
      {selectedDate&&selectedSlot&&<form className="ns-booking-form" onSubmit={submit}>
        <div className="ns-booking-selected-summary"><span>YOUR SELECTION</span><strong>{service}</strong><small>{prettyDate(selectedDate)} · {timeLabel(selectedSlot)}</small></div>
        <div className="ns-booking-form-grid">
          <label>Your name<input required minLength={2} maxLength={120} autoComplete="name" value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})} placeholder="Enter your name"/></label>
          <label>Phone / WhatsApp number<input required type="tel" inputMode="tel" autoComplete="tel" minLength={8} maxLength={20} pattern="[0-9+() -]{8,20}" value={form.customer_contact} onChange={e=>setForm({...form,customer_contact:e.target.value})} placeholder="Your contact number"/></label>
        </div>
        <label>Anything the provider should know? <span>(optional)</span><textarea rows={2} maxLength={1000} value={form.customer_note} onChange={e=>setForm({...form,customer_note:e.target.value})} placeholder="Add a short note about your requirement"/></label>
        {state.error&&<p className="ns-booking-error" role="alert">{state.error}</p>}
        <button className="ns-booking-submit" type="submit" disabled={state.saving}>{state.saving?"Sending request…":<>Request appointment <ArrowRight size={17}/></>}</button>
        <p className="ns-booking-footnote">No payment required. Your selected time is held while the provider reviews your request; it is confirmed only after they accept.</p>
      </form>}
    </>}
  </section>;
}
