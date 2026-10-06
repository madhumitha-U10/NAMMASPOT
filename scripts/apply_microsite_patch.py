from pathlib import Path
p=Path("src/main.jsx")
s=p.read_text()
if 'SellerMicrositePage' not in s:
    s=s.replace('import "./styles.css";', 'import "./styles.css";\nimport "./microsite.css";\nimport SellerMicrositePage from "./SellerMicrositePage.jsx";\nimport WebsiteEditorPage from "./WebsiteEditorPage.jsx";', 1)
s=s.replace('{route === "seller" && <SellerPage go={go} slug={getSellerSlug(path)} saved={saved} toggleSave={toggleSave}/>}',
            '{route === "seller" && <SellerMicrositePage go={go} slug={getSellerSlug(path)}/>}\n      {route === "website-editor" && <WebsiteEditorPage go={go}/>}')
s=s.replace('if (path.startsWith("/dashboard")) return "dashboard";',
            'if (path.startsWith("/dashboard/website")) return "website-editor";\n  if (path.startsWith("/dashboard")) return "dashboard";')
s=s.replace('["profile","products","enquiries","public"].map((item)=><button key={item} className={tab===item?"active":""} onClick={()=>setTab(item)}>{item.charAt(0).toUpperCase()+item.slice(1)}</button>)',
            '["profile","website","products","enquiries","public"].map((item)=><button key={item} className={tab===item?"active":""} onClick={()=>item==="website"?go("/dashboard/website"):setTab(item)}>{item==="website"?"My Website":item.charAt(0).toUpperCase()+item.slice(1)}</button>)')
p.write_text(s)
