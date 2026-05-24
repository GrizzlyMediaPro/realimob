import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Politica de confidențialitate",
  description:
    "Politica de confidențialitate Realimob — cum colectăm, utilizăm și protejăm datele personale conform GDPR.",
  path: "/politica-de-confidentialitate",
});

const COMPANY = "Realimob Real Estate S.R.L.";
const REG_COM = "J40112922024";
const CUI = "RO50196931";

export default function PoliticaConfidentialitatePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-[980px] px-4 pt-28 pb-12 md:px-8">
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          Politica de Confidențialitate Realimob
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Data ultimei actualizări: 16 Ianuarie 2025
        </p>

        <section className="space-y-6 text-sm md:text-base leading-7">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-galak-regular)" }}>
            II. Politica de confidențialitate a datelor
          </h2>

          <p>
            {COMPANY} (Nr. Registrul Comerțului: {REG_COM}, CUI: {CUI}) prelucrează o serie de
            date cu caracter personal ale Utilizatorilor, atunci când aceștia utilizează platforma
            Realimob sau Serviciile Societății.
          </p>

          <p>
            Această politică de confidențialitate (&quot;Politica&quot;) descrie ce tipuri de date
            cu caracter personal sunt prelucrate, cum sunt acestea utilizate, care sunt opțiunile
            dvs. în legătură cu aceste prelucrări, precum și modul în care vom respecta drepturile
            pe care le aveți în calitate de persoană vizată, conform legislației privind protecția
            datelor cu caracter personal, inclusiv Regulamentul (UE) 2016/679 (&quot;GDPR&quot;).
          </p>

          <p className="font-semibold uppercase text-xs md:text-sm tracking-wide">
            Înainte de a utiliza platforma Realimob sau serviciile noastre, vă recomandăm să citiți
            cu atenție această politică pentru a înțelege cum vă sunt prelucrate datele cu caracter
            personal.
          </p>

          <h2 className="text-lg font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            1. Cine este responsabil de prelucrarea datelor dvs.?
          </h2>
          <p>
            {COMPANY}, Nr. Registrul Comerțului: {REG_COM}, CUI: {CUI}, este operatorul datelor cu
            caracter personal, conform legislației privind protecția datelor cu caracter personal,
            inclusiv GDPR, în ceea ce privește datele cu caracter personal ale Utilizatorilor
            colectate și prelucrate prin intermediul platformei Realimob.
          </p>
          <p>
            Pentru activitatea de prelucrare a datelor cu caracter personal, Societatea și-a
            desemnat un responsabil cu protecția datelor (Data Protection Officer sau DPO) care poate
            fi contactat folosind datele de contact publicate pe platforma Realimob.
          </p>
          <p>
            În ceea ce privește datele colectate prin intermediul fișierelor de tip cookies pentru
            scop de marketing (pentru detalii a se vedea secțiunea Politica de Cookies), Societatea
            poate coopera cu parteneri autorizați pentru gestionarea modului în care sunt utilizate
            tehnologiile cookies pentru publicitatea on-line. În legătură cu aceste tipuri de
            prelucrări, Societatea acționează în conformitate cu art. 26 din GDPR, acolo unde este
            cazul. Societatea și partenerii și-au asumat obligația de a respecta legislația privind
            protecția datelor cu caracter personal în legătură cu această prelucrare.
          </p>

          <h2 className="text-lg font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            2. Ce date prelucrăm?
          </h2>
          <p>Prelucrăm următoarele categorii de date cu caracter personal:</p>

          <h3 className="font-semibold">2.1. Date pe care le furnizați în mod direct</h3>
          <p>
            Atunci când vă creați un cont de Utilizator, trebuie să ne furnizați o serie de date, cum
            ar fi: nume, prenume, adresa de e-mail / nr. telefon mobil.
          </p>
          <p>
            În cazul în care există raporturi comerciale (plata pentru publicarea unui anunț) trebuie
            furnizate informații suplimentare pentru emiterea facturii fiscale: adresa de domiciliu,
            denumirea societății comerciale, CUI, număr de ordine la Registrul Comerțului, adresa
            sediului social, în cazul persoanelor juridice. Puteți să includeți o serie de informații
            în profilul dvs. de Utilizator.
          </p>
          <p>
            De asemenea, prelucrăm anumite date cu caracter personal (de exemplu, date de
            identificare, date de contact, feedback / rating acordat altor Utilizatori) pe care le
            primim de la dvs., spre exemplu, în următoarele contexte: ca urmare a unor solicitări
            transmise prin e-mail sau chat, sau când comunicați prin intermediul platformei Realimob
            cu alți Utilizatori, informațiile privind anunțurile salvate de dvs.
          </p>
          <p>
            Pentru furnizarea unor servicii adiacente oferite de terți putem colecta date specifice
            necesare furnizării acestora, conform reglementărilor în vigoare (vârstă, adresa de
            domiciliu, vechimea la angajator, venitul obținut, rate lunare existente etc.). Totodată,
            putem colecta datele primite de la parteneri referitoare la rezoluția solicitărilor
            trimise de dvs. (de ex. stadiul dosarului de creditare, date financiare ale creditului
            contractat etc.).
          </p>

          <h3 className="font-semibold">2.2. Date colectate sau generate de noi ca urmare a interacțiunii dvs. cu platforma Realimob</h3>
          <p>
            Înregistrăm în jurnal informații cu privire la modul în care utilizați platforma
            Realimob, cum ar fi când și / sau cum vizitați sau utilizați Serviciile oferite de
            Societate, inclusiv modul în care utilizați platforma (e.g. dacă ați accesat platforma,
            ce tipuri de anunțuri ați vizualizat).
          </p>
          <p>
            În plus față de informațiile personale, sistemele noastre colectează în mod automat o
            serie de informații anonime care ne ajută să înțelegem mai bine cum este folosită
            platforma și cum putem să ne îmbunătățim Serviciile. Aceste date includ adresa de IP a
            computerului cu care accesați Realimob, sistemul de operare folosit, software-ul de
            navigare folosit și timpul petrecut în site, paginile vizitate, anunțurile contactate
            etc.
          </p>
          <p>
            De asemenea, utilizăm module cookie și tehnologii similare pentru a vă recunoaște pe
            dvs. și dispozitivele dvs. De asemenea, permitem altor persoane să utilizeze module
            cookie. Modul în care utilizăm aceste tehnologii este descris în Politica privind
            Cookies.
          </p>
          <p>
            În cazul aplicației mobile Realimob, utilizăm de asemenea date de geolocalizare oferite
            de dispozitivul mobil, precum și ID-ul Publicitar Google.
          </p>

          <h3 className="font-semibold">2.3. Datele obținute de la terți</h3>
          <p>
            Primim informații despre vizitele dvs. și interacțiunea cu serviciile furnizate de alte
            entități când vizitați serviciile altor furnizori care includ reclame, module cookie sau
            tehnologii asemănătoare.
          </p>

          <h2 className="text-lg font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            3. De ce vă prelucrăm datele cu caracter personal?
          </h2>
          <p>
            În cele ce urmează vă vom informa cu privire la scopurile pentru care colectăm și
            prelucrăm datele dvs. cu caracter personal, precum și cu privire la temeiul legal pentru
            prelucrarea datelor.
          </p>

          <h3 className="font-semibold">3.1. Utilizarea Serviciilor de către Utilizatori</h3>
          <p>
            Anumite Servicii puse la dispoziție prin intermediul Platformei pot fi accesate fără
            înregistrarea unui cont de Utilizator, însă dacă doriți să vă bucurați de toate
            facilitățile oferite de platforma Realimob, trebuie să vă creați un cont de Utilizator.
            Contul de Utilizator vă permite să accesați o serie de Servicii dedicate Utilizatorilor
            înregistrați, cum ar fi să încărcați anunțuri, să salvați anunțurile preferate, să
            comunicați cu alți Utilizatori, să primiți anunțuri și alerte în legătură cu anunțurile
            imobiliare publicate etc.
          </p>
          <p>
            <strong>Temeiul juridic:</strong> art. 6(1)(b) GDPR — încheierea și executarea
            contractului
          </p>
          <p>
            În cazul datelor cu caracter personal ale reprezentanților Utilizatorilor (persoane
            juridice) avem un interes legitim să ne desfășurăm în mod adecvat raporturile contractuale
            cu clienții noștri persoane juridice. Drepturile și interesele persoanelor fizice (i.e.
            reprezentanții Utilizatorilor persoane juridice) nu sunt prejudiciate întrucât din
            perspectiva clientului persoană juridică, prelucrarea este necesară în contextul
            desfășurării relațiilor de muncă / colaborare pe care aceștia o au cu persoanele fizice
            ale căror date sunt furnizate / asociate contului de Utilizator (persoană juridică).
          </p>
          <p>
            <strong>Temeiul juridic:</strong> art. 6(1)(f) GDPR — interes legitim
          </p>
          <p>
            În cazul în care colectăm date pentru serviciile de intermediere credite oferite de
            terți avem un interes legitim. Considerăm că interesul nostru legitim nu aduce atingere
            drepturilor și intereselor persoanelor vizate întrucât comunicările sunt legate strâns
            de furnizarea Serviciilor solicitate.
          </p>
          <p>
            <strong>Temeiul juridic:</strong> art. 6(1)(f) GDPR — interes legitim
          </p>

          <h3 className="font-semibold">3.2. Gestiunea relațiilor cu Utilizatorii și suport</h3>
          <p>
            Prelucrăm o serie de date cu caracter personal pentru a gestiona relațiile cu
            Utilizatorii platformei Realimob, spre exemplu, atunci când ne contactează cu diverse
            întrebări sau solicitări privind funcționalitățile platformei, disfuncționalități sau
            erori.
          </p>
          <p>
            De asemenea, ca parte a serviciilor de suport și gestiune a relațiilor cu Utilizatorii,
            putem fi contactați și putem contacta Utilizatorii și prin telefon.
          </p>
          <p>
            Putem înregistra convorbirile telefonice cu Utilizatorii. Înregistrarea convorbirilor
            ne ajută să gestionăm activitatea noastră internă în departamentul relevant. De asemenea,
            aceste înregistrări pot fi folosite pentru a verifica modul în care au fost soluționate
            cererile Utilizatorilor sau în cazul unor eventuale litigii / dispute legate de modul
            de gestiune a activității noastre în relația cu Utilizatorii. Înregistrarea se va face
            doar dacă vom avea consimțământul interlocutorului.
          </p>
          <p>
            <strong>Temeiul juridic:</strong> art. 6(1)(f) GDPR — interes legitim pentru
            înregistrarea convorbirii; art. 6(1)(a) GDPR — consimțământ; și art. 6(1)(f) GDPR —
            interes legitim (dacă înregistrările sunt ulterior necesare pentru apărarea drepturilor și
            intereselor noastre în justiție, efectuarea de cercetări disciplinare cu privire la
            angajații noștri etc.)
          </p>

          <h3 className="font-semibold">3.3. Furnizarea de comunicări privind Serviciile</h3>
          <p>
            Utilizatorii pot primi diverse comunicări de la Societate care țin de furnizarea
            Serviciilor (e.g. dacă Utilizatorul a primit un mesaj din partea altor Utilizatori,
            notificări privind situația vizualizărilor și / sau accesărilor anunțurilor postate de
            Utilizatori etc.). Considerăm că interesul nostru legitim nu aduce atingere drepturilor
            și intereselor persoanelor vizate întrucât comunicările sunt legate strâns de furnizarea
            Serviciilor solicitate.
          </p>
          <p>
            <strong>Temeiul juridic:</strong> art. 6(1)(f) GDPR — interes legitim
          </p>

          <h3 className="font-semibold">3.4. Furnizarea de comunicări comerciale</h3>
          <p>
            Dorim să vă transmitem comunicări comerciale (cum ar fi trimiterea de anunțuri similare
            privind proprietățile disponibile pe platforma Realimob ca urmare a completării
            chestionarului de satisfacție de la 3.10, anunțuri despre vânzarea, închirierea sau
            amenajarea locuințelor), informări privind noile Servicii oferite de Societate, precum
            și pentru a vă comunica alte informații similare care considerăm că pot fi de interes
            pentru dvs. Vom face acest lucru numai după obținerea și în baza consimțământului dvs.
            neechivoc.
          </p>
          <p>
            De asemenea, dacă sunteți de acord, datele dvs. pot fi comunicate partenerilor noștri
            sau Societatea le poate folosi (fără a le dezvălui partenerilor), pentru a vă transmite
            materiale promoționale / comunicări comerciale privind produsele / serviciile
            partenerilor Societății.
          </p>
          <p>
            Utilizatorii se pot oricând dezabona de la aceste comunicări. Spre exemplu, dacă vă
            retrageți consimțământul pentru comunicările comerciale nu vă vom mai putea transmite
            ofertele noastre.
          </p>
          <p>
            Dezabonarea se poate efectua specific, folosind link-ul de dezabonare din subsolul
            e-mailului primit, sau se poate efectua generic din Contul meu de pe platforma Realimob,
            secțiunea Setări, de unde pot fi gestionate toate abonările existente.
          </p>
          <p>
            <strong>Temei juridic:</strong> art. 6(1)(a) GDPR — consimțământ
          </p>

          <h3 className="font-semibold">
            3.5. Analiza interacțiunii dvs. cu Societatea în vederea furnizării unor oferte personalizate
          </h3>
          <p>
            Putem realiza diverse raportări, analize și studii statistice cu privire la campaniile
            de marketing organizate și succesul acestora, sau cu privire la activitatea de vânzări a
            Societății.
          </p>
          <p>
            În anumite situații, putem utiliza informațiile colectate de la dvs. în combinație cu
            datele pe care le obținem de la echipele noastre de vânzări și / sau de marketing cu
            privire la interacțiunea dvs. cu Societatea, pe care să le folosim în contextul
            comunicărilor noastre de marketing. Dorim să eficientizăm activitatea noastră de
            marketing, oferind clienților noștri produse / servicii relevante și personalizate. Toate
            informațiile utilizate sunt în format anonimizat.
          </p>
          <p>
            <strong>Temei juridic:</strong> art. 6(1)(f) GDPR — interes legitim; art. 6(1)(a) GDPR
            — consimțământ (în cazul analizelor de marketing avansate)
          </p>

          <h3 className="font-semibold">
            3.6. Analize și statistici privind funcționarea site-ului, cookies și tehnologii similare
          </h3>
          <p>
            Putem folosi datele cu caracter personal pe care le furnizează Utilizatorii sau pe care
            le colectăm în contextul utilizării Serviciilor pentru scopul efectuării unor analize și
            statistici privind Serviciile noastre, inclusiv a modului în care funcționează platforma
            sau sunt oferite Serviciile. Analizele și statisticile pe care le facem ne ajută să
            înțelegem mai bine cum am putea să îmbunătățim Serviciile noastre sau funcționalitățile
            site-ului.
          </p>
          <p>
            În efectuarea analizelor și statisticilor utilizăm de asemenea cookies și alte tehnologii
            similare conform Politicii privind Cookies.
          </p>
          <p>
            De asemenea, cookie-urile și tehnologiile similare sunt utilizate pentru a vă oferi
            publicitate bazată pe interes. În cazul în care utilizați aplicația Realimob putem
            colecta și datele de geolocalizare — pentru a determina și a vă prezența anunțuri
            imobiliare din zona în care e localizat dispozitivul. Vom folosi aceste date doar dacă vă
            dați acordul pentru aceasta, folosind setările de localizare ale dispozitivului sau alte
            instrumente / setări disponibile în aplicație.
          </p>
          <p>
            <strong>Temei juridic:</strong> art. 6(1)(f) GDPR — interes legitim; în funcție de
            tipologia cookie-urilor utilizate și a tehnologiilor similare temeiul juridic este:
            art. 6(1)(f) GDPR — interes legitim pentru cookies necesare și funcționale sau art.
            6(1)(a) GDPR — consimțământ pentru cookie-urile de analiză, tracking și publicitate
            comportamentală.
          </p>

          <h3 className="font-semibold">3.7. Conectare prin rețele de socializare</h3>
          <p>
            Utilizatorii se pot autentifica sau pot crea cont prin intermediul plugin-ului Facebook,
            Google sau Apple. Atunci când Utilizatorii folosesc această facilitate, vom utiliza datele
            publice (e.g. nume, prenume, imagine de profil, adresa de e-mail, număr de telefon).
            Utilizarea acestor date este necesară pentru crearea contului de Utilizator. Ulterior
            creării contului, utilizatorul poate merge în Contul meu și poate șterge informațiile
            preluate automat, cu excepția celor necesare creării contului (nume, adresa de e-mail).
          </p>
          <p>
            De asemenea, am implementat diverse mecanisme de interconectare cu paginile de
            socializare, cum ar fi Facebook și Youtube, astfel încât să aveți posibilitatea să accesați
            mai ușor conținutul postat de noi pe conturile noastre asociate acelor rețele sociale.
          </p>
          <p>
            Dacă accesați conținutul postat sau comentați pe acele rețele de socializare, o serie de
            date publice din profilul dvs. de pe acele rețele de socializare ne vor fi transmise și
            nouă de către operatorii acelor rețele de socializare.
          </p>
          <p>
            <strong>Temeiul juridic:</strong> art. 6(1)(b) din GDPR — încheierea și executarea
            contractului (în cazul datelor de login Facebook) sau art. 6(1)(a) GDPR — consimțământ
            (în celelalte situații)
          </p>

          <h3 className="font-semibold">3.8. Îndeplinirea unor obligații legale</h3>
          <p>
            Uneori, prelucrarea datelor este necesară pentru a ne îndeplini obligațiile legale ce ne
            revin, cum ar fi:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              plata impozitelor și a contribuțiilor relevante, raportarea către autoritățile fiscale
              relevante și ținerea unor evidențe contabile;
            </li>
            <li>arhivarea datelor conform legislației aplicabile.</li>
          </ul>

          <h3 className="font-semibold">3.9. Apărarea drepturilor și intereselor în justiție</h3>
          <p>
            Pentru constatarea, exercitarea sau apărarea unui drept în justiție sau în cadrul unei
            proceduri în fața unei instanțe, a unei proceduri administrative sau a altor proceduri
            oficiale în care este implicată Societatea. Astfel, putem să folosim datele atât într-un
            litigiu între persoana vizată și Societate, sau în cazul unui litigiu între Utilizatori
            sau între Utilizator și terțe părți, ca urmare a unei eventuale încălcări a drepturilor
            acestor terțe părți. Societatea va folosi aceste date minimizând pe cât posibil accesul
            la acestea și doar la cererea expresă a unei autorități îndreptățite a cere acces la
            date.
          </p>
          <p>
            <strong>Temei juridic:</strong> art. 6(1)(f) GDPR — interes legitim
          </p>

          <h3 className="font-semibold">
            3.10. Acordarea de testimoniale și rating-uri pentru interacțiunea cu alți Utilizatori
          </h3>
          <p>
            Atunci când contactați agenți imobiliari ce au calitatea de Utilizatori ai Platformei,
            prin mijloacele de comunicare puse la dispoziție de platforma Realimob și, în cazul în
            care nu v-ați opus prelucrării datelor de către Societate, vă vom trimite pe e-mail un
            chestionar de satisfacție (&quot;Chestionarul&quot;), prin care veți putea evalua
            interacțiunea dvs. cu agentul imobiliar prin acordarea unui calificativ
            (&quot;Rating&quot;) în legătură cu promovarea unui anunț publicat pe platforma
            Realimob și tranzacționarea cu privire la proprietatea imobiliară promovată, dacă este
            cazul.
          </p>
          <p>
            Prin completarea Chestionarului, veți putea: (i) atribui / revizui Rating-ul acordat
            interacțiunii dvs. cu agentul imobiliar, evaluând, de exemplu: corectitudinea
            informațiilor din anunțul de proprietate, profesionalismul agentului imobiliar,
            cunoștințele agentului despre piața imobiliară etc. și (ii) scrie un mesaj testimonial
            prin care veți descrie interacțiunea dvs. cu agentul imobiliar. Societatea a adoptat măsuri
            tehnice și organizatorice de asigurare a securității datelor cu caracter personal,
            incluzând următoarele:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Rating-ul atribuit interacțiunii dvs. cu agentul imobiliar va fi publicat de Societate
              pe platforma Realimob, în formă agregată (i.e. media calificativelor acordate pentru
              fiecare componentă evaluată) și fără a include datele dvs. cu caracter personal;
            </li>
            <li>
              Aveți posibilitatea să decideți ca identitatea dvs. să rămână anonimă pentru agentul
              imobiliar / agenția reprezentată de agentul imobiliar (a se vedea în acest sens și
              Secțiunea 4 de mai jos).
            </li>
          </ul>
          <p>
            <strong>Temei juridic:</strong> art. 6(1)(f) GDPR — interesul nostru legitim de a
            asigura transparența privind calitatea Serviciilor oferite de partenerii contractuali ai
            Societății și de a îmbunătăți serviciile Societății pentru beneficiul Utilizatorilor.
          </p>
          <p>
            <strong>Exercitarea dreptului de opoziție.</strong> Vă puteți opune oricând prelucrărilor
            bazate pe interesul legitim urmărit de Societate sau de terți, descrise mai sus,
            transmițându-ne o solicitare prin datele de contact disponibile pe platforma Realimob sau
            prin mijloacele puse la dispoziție de Societate.
          </p>
          <p>
            În cazul în care vă opuneți prelucrării datelor, Societatea nu vă va contacta în vederea
            completării Chestionarului de satisfacție.
          </p>
          <p>
            Pentru a vă putea respecta dreptul de opoziție în legătură cu contactarea dvs. pentru
            completarea Chestionarului de satisfacție, Societatea va stoca, folosind sisteme software
            specializate, informațiile referitoare la opțiunea exprimată în legătură cu transmiterea
            Chestionarului de satisfacție.
          </p>
          <p>
            <strong>Temei juridic:</strong> art. 6(1)(f) GDPR — interesul nostru legitim de a
            organiza și gestiona, în mod eficient, activitatea noastră referitoare la Chestionarele
            de satisfacție, astfel încât să asigurăm respectarea drepturilor dvs.
          </p>

          <h2 className="text-lg font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            4. Cui dezvăluim datele?
          </h2>
          <p>
            Putem dezvălui datele dvs. cu caracter personal către: (i) entitățile și / sau persoanele
            împuternicite de noi implicate în furnizarea Serviciilor, inclusiv în furnizarea
            comunicărilor comerciale (cum ar fi furnizorilor de centre de date precum Hetzner,
            Amazon, Sailthru, Google etc., care au centrele de date în Uniunea Europeană); (ii)
            ceilalți Utilizatori ai platformei Realimob (de exemplu, agenți imobiliari) atunci când
            vă transmiteți datele de contact sau contactați alți Utilizatori prin mecanismele de
            comunicare puse la dispoziție de platforma Realimob. Dacă aveți cont pe platforma
            Realimob, transmitem datele dvs. cu caracter personal (de exemplu, date de
            identificare, date de contact) în temeiul consimțământului dvs. (art. 6(1) lit. a) din
            GDPR). Dacă nu aveți cont pe platforma Realimob, transmitem datele dvs. cu caracter
            personal (de exemplu, date de identificare, date de contact) pe care le includeți în
            formularul de contact, în temeiul interesului nostru legitim ori al unor terți de a
            gestiona cu celeritate și cât mai eficient solicitările dvs. (art. 6(1) lit. f) din
            GDPR); (iii) către agenția imobiliară reprezentată de agentul imobiliar și către agentul
            respectiv atunci când completați un Chestionar de satisfacție, conform 3.10 (ii) de mai
            sus, în temeiul interesului nostru legitim ori al unor terți (i.e. agențiilor imobiliare)
            cu scopul de a îmbunătăți serviciile disponibile pe platforma Realimob; (iv) dacă avem
            obligația de a divulga datele personale în scopul conformării cu orice obligație legală
            sau decizie a unei autorități judiciare, autorități publice sau organ guvernamental; sau
            (v) dacă ni se cere sau ni se permite în alt mod să facem acest lucru conform legislației
            aplicabile.
          </p>
          <p>
            De asemenea, datele dvs. cu caracter personal pot fi dezvăluite terților — furnizori de
            cookies și tehnologii similare conform celor descrise în Politica privind Cookies. În
            această situație, datele dvs. cu caracter personal colectate prin intermediul cookies /
            tehnologiilor similare ar putea fi transferate unor state terțe (i.e. din afara Uniunii
            Europene) cărora nu li s-a recunoscut un nivel de protecție adecvat. Ex.: Cheq AI
            Technologies (2018) Ltd., TikTok Information Technologies (UK Limited), AppsFlyer Ltd.,
            CustomerLabs, INC.
          </p>

          <h2 className="text-lg font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            5. Cât păstrăm datele?
          </h2>
          <p>
            Păstrăm datele dvs. cu caracter personal cât este necesar pentru îndeplinirea scopurilor
            pentru care au fost colectate, cu respectarea procedurilor interne privind retenția
            datelor, inclusiv a regulilor de arhivare aplicabile.
          </p>
          <p>
            În general, datele Utilizatorilor sunt păstrate atât timp cât acesta are un cont de
            Utilizator în platforma Realimob. Datele cu caracter personal vor fi șterse dacă
            Utilizatorul solicită dezactivarea și ștergerea contului, sau după o perioadă de 12
            luni de la data la care Utilizatorul devine inactiv (i.e. de la data ultimei interacțiuni
            în platforma Realimob).
          </p>
          <p>
            Anumite date ale Utilizatorilor (persoane juridice sau persoane fizice care accesează
            serviciile cu plată) pot fi păstrate pe întreaga perioadă prevăzută de lege pentru
            activitatea de arhivare și păstrare a documentelor financiar-contabile.
          </p>
          <p>
            Datele aferente cookie-urilor și tehnologiilor similare sunt păstrate conform termenelor
            specifice setate pentru respectivele tehnologii, termenul de stocare putând fi între
            durata sesiunii de navigare (pentru cookie de sesiune) și o durată de până la 2 ani
            (pentru cookies de analiză). Mai multe informații despre perioada de stocare a fiecărui
            cookie puteți regăsi în secțiunea Cookies.
          </p>

          <h2 className="text-lg font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            6. Ce drepturi aveți în calitate de persoană vizată?
          </h2>
          <p>
            Conform legii, vă sunt recunoscute următoarele drepturi în calitate de persoană vizată:
          </p>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong>a) Dreptul de acces</strong> — puteți obține de la noi confirmarea că
              prelucrăm datele dvs. personale, precum și informații privind specificul prelucrării
            </li>
            <li>
              <strong>b) Dreptul de a corecta datele</strong> — puteți să ne solicitați modificarea
              datelor dvs. personale incorecte ori, după caz, completarea datelor care sunt
              incomplete
            </li>
            <li>
              <strong>c) Dreptul la ștergere</strong> — puteți solicita ștergerea datelor personale
              atunci când: (i) acestea nu mai sunt necesare pentru scopurile pentru care le-am
              colectat și le prelucrăm; (ii) v-ați retras consimțământul pentru prelucrarea datelor
              și noi nu le mai putem prelucra pe alte temeiuri legale; (iii) datele sunt prelucrate
              contrar legii; respectiv (iv) datele trebuie șterse conform legislației relevante
            </li>
            <li>
              <strong>d) Retragerea consimțământului și dreptul de opoziție</strong> — puteți să vă
              retrageți oricând consimțământul cu privire la prelucrarea datelor pe bază de
              consimțământ. De asemenea, vă puteți opune oricând prelucrărilor pentru scop de
              marketing, inclusiv profilărilor efectuate în acest scop, precum și prelucrărilor
              bazate pe interesul legitim al Societății, din motive care țin de situația dvs.
              specifică
            </li>
            <li>
              <strong>e) Restricționare</strong> — în anumite condiții puteți solicita restricționarea
              prelucrării datelor dvs. personale
            </li>
            <li>
              <strong>f) Dreptul la portabilitatea datelor</strong> — în măsura în care prelucrăm
              datele prin mijloace automate, puteți să ne solicitați, în condițiile legii, să furnizăm
              datele dvs. într-o formă structurată, utilizată frecvent și care poate fi citită în mod
              automat. Dacă ne solicitați acest lucru, putem să transmitem datele dvs. unei alte
              entități, dacă este posibil din punct de vedere tehnic
            </li>
            <li>
              <strong>g) Dreptul de a depune o plângere la autoritatea de supraveghere</strong> —
              aveți dreptul de a depune o plângere la autoritatea de supraveghere a prelucrării
              datelor în cazul în care considerați că v-au fost încălcate drepturile: Autoritatea
              Națională pentru Supravegherea Datelor cu Caracter Personal din România, B-dul G-ral.
              Gheorghe Magheru 28-30, Sector 1, cod poștal 010336, București, România —
              anspdcp@dataprotection.ro
            </li>
          </ul>

          <p className="font-semibold uppercase text-xs md:text-sm tracking-wide pt-2">
            Pentru exercitarea drepturilor menționate mai sus, ne puteți contacta utilizând datele
            de contact menționate la secțiunea 1.
          </p>
          <p>
            De asemenea, {COMPANY} poate fi contactată utilizând datele și mecanismele de contact
            disponibile în platforma Realimob. Utilizatorii pot să își exercite anumite drepturi
            (drept de editare, rectificare, opoziție la comunicări comerciale sau ștergere) direct în
            platforma Realimob prin intermediul setărilor din secțiunea Contul meu.
          </p>
          <p>
            Datele cu caracter personal sunt stocate în cloud, în baze de date criptate la care
            accesul este limitat și restricționat.
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400 pt-4">
            {COMPANY} · Nr. Registrul Comerțului: {REG_COM} · CUI: {CUI}
            <br />
            (Data ultimei revizuiri: 16.01.2025)
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
