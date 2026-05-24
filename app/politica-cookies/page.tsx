import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Politica privind cookie-urile",
  description:
    "Informații despre modulele cookie și tehnologiile similare utilizate pe platforma Realimob — tipuri, scopuri și gestionarea consimțământului.",
  path: "/politica-cookies",
});

const COMPANY = "Realimob Real Estate S.R.L.";
const REG_COM = "J40112922024";
const CUI = "RO50196931";
const CONTACT_EMAIL = "contact@realimob.ro";
const DSA_EMAIL = "dsa@realimob.ro";
const CONTACT_PHONE = "0729772025";

export default function PoliticaCookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-[980px] px-4 pt-28 pb-12 md:px-8">
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          Politica privind Cookie-urile și Tehnologiile Similare
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Data ultimei actualizări: 21 mai 2026
        </p>

        <section className="space-y-6 text-sm md:text-base leading-7">
          <p>
            Prezenta politică privind cookie-urile (&quot;Politica Cookie&quot;) explică ce sunt
            modulele cookie și tehnologiile similare, cum le utilizează {COMPANY} (&quot;Societatea&quot;,
            &quot;noi&quot;) pe platforma Realimob (site-ul web și serviciile asociate,
            &quot;Platforma&quot;), care sunt categoriile utilizate, temeiurile legale și opțiunile de
            care dispuneți.
          </p>

          <p className="font-semibold uppercase text-xs md:text-sm tracking-wide">
            Politica Cookie completează{" "}
            <Link href="/politica-de-confidentialitate" className="text-[#C25A2B] underline">
              Politica de Confidențialitate
            </Link>
            . Vă recomandăm să citiți ambele documente înainte de utilizarea Platformei.
          </p>

          <h2 className="text-xl font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            1. Operatorul datelor și date de contact
          </h2>
          <p>
            Operatorul datelor cu caracter personal prelucrate prin cookie-uri și tehnologii similare
            pe Platformă este {COMPANY}, Nr. Registrul Comerțului: {REG_COM}, CUI: {CUI}.
          </p>
          <p>
            Pentru întrebări legate de această politică, exercitarea drepturilor sau aspecte privind
            protecția datelor, ne puteți contacta la:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              e-mail general:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#C25A2B] underline">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              e-mail DSA / notificări legale:{" "}
              <a href={`mailto:${DSA_EMAIL}`} className="text-[#C25A2B] underline">
                {DSA_EMAIL}
              </a>
            </li>
            <li>telefon suport: {CONTACT_PHONE}</li>
          </ul>
          <p>
            Societatea și-a desemnat un responsabil cu protecția datelor (DPO), care poate fi
            contactat prin aceleași canale, în măsura în care solicitarea vizează protecția datelor
            personale.
          </p>

          <h2 className="text-xl font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            2. Cadru legal
          </h2>
          <p>Utilizarea cookie-urilor și a tehnologiilor similare este reglementată, în principal, de:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Regulamentul (UE) 2016/679 privind protecția persoanelor fizice în ceea ce privește
              prelucrarea datelor cu caracter personal (&quot;GDPR&quot;), în special în ceea ce privește
              datele colectate prin astfel de tehnologii;
            </li>
            <li>
              Legea nr. 506/2004 privind prelucrarea datelor cu caracter personal și protecția vieții
              private în sectorul comunicațiilor electronice, care transpune în dreptul românesc
              prevederile Directivei 2002/58/CE (Directiva ePrivacy), în versiunea în vigoare;
            </li>
            <li>
              Recomandările și practica Autorității Naționale de Supraveghere a Prelucrării Datelor
              cu Caracter Personal (ANSPDCP), inclusiv orientările privind consimțământul pentru
              cookie-uri non-esențiale.
            </li>
          </ul>
          <p>
            Cookie-urile strict necesare pentru funcționarea Platformei sau pentru furnizarea unui
            serviciu solicitat în mod explicit de dvs. (de exemplu, autentificarea) pot fi utilizate
            fără consimțământ prealabil. Pentru cookie-urile de analiză, marketing și alte categorii
            non-esențiale, solicităm consimțământul dvs. înainte de plasarea acestora, conform
            mecanismului descris la secțiunea 6.
          </p>

          <h2 className="text-xl font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            3. Ce sunt cookie-urile și tehnologiile similare?
          </h2>
          <p>
            Un &quot;cookie&quot; (sau modul cookie) este un fișier de mici dimensiuni, format din litere și
            cifre, stocat pe dispozitivul dvs. (computer, telefon, tabletă) atunci când accesați
            Platforma. Cookie-urile sunt trimise de serverul web către browserul dvs. și pot fi citite
            ulterior de același server sau, în cazul cookie-urilor terțe, de alte site-uri.
          </p>
          <p>
            Cookie-urile pot fi: <strong>de sesiune</strong> (se șterg la închiderea browserului) sau{" "}
            <strong>persistente</strong> (rămân pe dispozitiv până la expirare sau ștergere manuală).
            Pot fi <strong>first-party</strong> (setate de domeniul Realimob) sau{" "}
            <strong>third-party</strong> (setate de furnizori externi, ex. servicii de autentificare).
          </p>
          <p>
            În sens larg, prin &quot;tehnologii similare&quot; înțelegem și alte mecanisme de stocare locală,
            cum ar fi <strong>localStorage</strong> și <strong>sessionStorage</strong> din browser,
            utilizate pentru preferințe sau pentru memorarea alegerilor dvs. privind consimțământul.
            Acestea nu sunt cookie-uri HTTP, dar pot stoca informații pe dispozitivul dvs. și sunt
            tratate similar din perspectiva transparenței și, unde este cazul, a consimțământului.
          </p>

          <h2 className="text-xl font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            4. Categorii de cookie-uri și tehnologii utilizate
          </h2>
          <p>Pe Platforma Realimob clasificăm tehnologiile astfel:</p>

          <h3 className="font-semibold text-base pt-1">
            4.1. Cookie-uri strict necesare (esențiale)
          </h3>
          <p>
            Acestea sunt indispensabile pentru funcționarea Platformei: autentificare, securitate,
            menținerea sesiunii, prevenirea fraudei, echilibrare trafic sau finalizarea unor fluxuri
            tehnice solicitate de dvs. (ex. conectarea Google Calendar pentru agenți). Fără ele,
            anumite funcții (cont utilizator, panou agent, administrare) nu pot funcționa corect.
          </p>
          <p>
            <strong>Temei legal:</strong> interes legitim (art. 6 alin. (1) lit. f) GDPR) și/sau
            necesitatea pentru executarea unui contract sau a măsurilor precontractuale la cererea
            dvs. (art. 6 alin. (1) lit. b) GDPR); pentru comunicații electronice, exceptarea de la
            consimțământ conform Legii 506/2004 pentru cookie-uri strict necesare.
          </p>

          <h3 className="font-semibold text-base pt-1">4.2. Cookie-uri funcționale</h3>
          <p>
            Permit reținerea unor alegeri (limbă, temă vizuală, monedă afișată) pentru a îmbunătăți
            experiența. Unele sunt stocate în localStorage, nu ca cookie HTTP. În general, nu necesită
            consimțământ separat dacă sunt strict legate de funcționalități solicitate de dvs. pe
            Platformă; totuși, le descriem transparent mai jos.
          </p>

          <h3 className="font-semibold text-base pt-1">4.3. Cookie-uri de analiză (statistici)</h3>
          <p>
            Ne ajută să înțelegem cum este utilizată Platforma (pagini vizitate, erori, performanță).
            <strong> La data acestei politici, Platforma nu încarcă scripturi de analiză de la terți</strong>{" "}
            (de ex. Google Analytics) în mod implicit. Categoria este disponibilă în bannerul de
            consimțământ; dacă o acceptați, vom putea activa în viitor astfel de instrumente, iar
            până atunci nu se plasează cookie-uri de analiză suplimentare. Mecanismul tehnic blochează
            setarea cookie-urilor non-esențiale până la acordul dvs.
          </p>
          <p>
            <strong>Temei legal (când sunt active):</strong> consimțământ (art. 6 alin. (1) lit. a)
            GDPR și art. 5 alin. (3) din Legea 506/2004.
          </p>

          <h3 className="font-semibold text-base pt-1">4.4. Cookie-uri de marketing și publicitate</h3>
          <p>
            Pot fi utilizate pentru publicitate personalizată, remarketing sau măsurarea campaniilor.
            <strong> La data acestei politici, Platforma nu plasează cookie-uri de marketing</strong>{" "}
            decât dacă și până când veți accepta explicit această categorie în banner, iar astfel de
            tehnologii vor fi implementate. Anunțurile publicate de utilizatori pot fi promovate pe
            canale partenere conform{" "}
            <Link href="/termeni-si-conditii" className="text-[#C25A2B] underline">
              Termenilor și Condițiilor
            </Link>
            ; aceasta este o activitate distinctă de cookie-urile setate în browserul vizitatorului
            Platformei.
          </p>
          <p>
            <strong>Temei legal (când sunt active):</strong> consimțământ (art. 6 alin. (1) lit. a)
            GDPR).
          </p>

          <h2 className="text-xl font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            5. Inventar detaliat al cookie-urilor și stocărilor locale
          </h2>
          <p>
            Tabelul de mai jos reflectă tehnologiile utilizate la data actualizării acestei politici.
            Duratele pot varia ușor în funcție de setările furnizorilor; pentru cookie-urile terțe,
            consultați și politicile acestora.
          </p>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[720px] text-left text-xs md:text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-3 py-2 font-semibold">Denumire</th>
                  <th className="px-3 py-2 font-semibold">Tip</th>
                  <th className="px-3 py-2 font-semibold">Furnizor</th>
                  <th className="px-3 py-2 font-semibold">Scop</th>
                  <th className="px-3 py-2 font-semibold">Durată</th>
                  <th className="px-3 py-2 font-semibold">Categorie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-3 py-2 font-mono text-[11px] md:text-xs">__clerk_*</td>
                  <td className="px-3 py-2">Cookie HTTP</td>
                  <td className="px-3 py-2">Clerk Inc.</td>
                  <td className="px-3 py-2">Autentificare, sesiune, securitate cont</td>
                  <td className="px-3 py-2">Sesiune / persistent (conform Clerk)</td>
                  <td className="px-3 py-2">Esențial</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-[11px] md:text-xs">__session</td>
                  <td className="px-3 py-2">Cookie HTTP</td>
                  <td className="px-3 py-2">Clerk Inc.</td>
                  <td className="px-3 py-2">Menținere sesiune autentificată</td>
                  <td className="px-3 py-2">Sesiune</td>
                  <td className="px-3 py-2">Esențial</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-[11px] md:text-xs">__client</td>
                  <td className="px-3 py-2">Cookie HTTP</td>
                  <td className="px-3 py-2">Clerk Inc.</td>
                  <td className="px-3 py-2">Identificare client în fluxul de autentificare</td>
                  <td className="px-3 py-2">Sesiune</td>
                  <td className="px-3 py-2">Esențial</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-[11px] md:text-xs">gc_oauth_state</td>
                  <td className="px-3 py-2">Cookie HTTP</td>
                  <td className="px-3 py-2">Realimob (first-party)</td>
                  <td className="px-3 py-2">
                    Protecție CSRF în fluxul OAuth Google Calendar (agenți)
                  </td>
                  <td className="px-3 py-2">Scurt (flux OAuth, ~10 min.)</td>
                  <td className="px-3 py-2">Esențial (serviciu solicitat)</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-[11px] md:text-xs">realimob-cookie-consent</td>
                  <td className="px-3 py-2">localStorage</td>
                  <td className="px-3 py-2">Realimob</td>
                  <td className="px-3 py-2">
                    Memorarea preferințelor dvs. privind cookie-urile (categorii acceptate, versiune
                    banner)
                  </td>
                  <td className="px-3 py-2">Până la ștergere manuală</td>
                  <td className="px-3 py-2">Esențial (consimțământ)</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-[11px] md:text-xs">theme</td>
                  <td className="px-3 py-2">localStorage</td>
                  <td className="px-3 py-2">Realimob</td>
                  <td className="px-3 py-2">Preferință temă (luminos / întunecat / sistem)</td>
                  <td className="px-3 py-2">Până la ștergere manuală</td>
                  <td className="px-3 py-2">Funcțional</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-[11px] md:text-xs">realimob-display-currency</td>
                  <td className="px-3 py-2">localStorage</td>
                  <td className="px-3 py-2">Realimob</td>
                  <td className="px-3 py-2">Moneda selectată pentru afișarea prețurilor</td>
                  <td className="px-3 py-2">Până la ștergere manuală</td>
                  <td className="px-3 py-2">Funcțional</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Prefixele de cookie Clerk pot include variante precum{" "}
            <span className="font-mono">__clerk_db_jwt</span>,{" "}
            <span className="font-mono">__client_uat</span> etc., în funcție de fluxul de
            autentificare. Politica de confidențialitate Clerk:{" "}
            <a
              href="https://clerk.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C25A2B] underline"
            >
              clerk.com/privacy
            </a>
            .
          </p>

          <h2 className="text-xl font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            6. Consimțământul și bannerul de cookie-uri
          </h2>
          <p>
            La prima vizită (sau după ștergerea preferințelor salvate), Platforma afișează un banner
            de consimțământ care vă permite să:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Acceptați toate</strong> categoriile (esențiale, analitice, marketing);
            </li>
            <li>
              <strong>Refuzați cookie-urile non-esențiale</strong> (&quot;Doar esențiale&quot;);
            </li>
            <li>
              <strong>Personalizați</strong> alegerile pe categorii, prin comutatoare separate pentru
              analitice și marketing.
            </li>
          </ul>
          <p>
            Până când nu înregistrați o alegere, un script tehnic blochează setarea cookie-urilor
            non-esențiale în browser, permițând doar cookie-urile esențiale (autentificare Clerk).
            Accesul la Platformă nu este condiționat de acceptarea cookie-urilor opționale — puteți
            utiliza serviciile de bază și cu opțiunea &quot;Doar esențiale&quot;.
          </p>
          <p>
            <strong>Retragerea consimțământului</strong> trebuie să fie la fel de ușoară ca acordarea
            acestuia. Pentru a modifica preferințele:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Ștergeți din browser datele site-ului pentru cheia{" "}
              <span className="font-mono">realimob-cookie-consent</span> (localStorage) și cookie-urile
              non-esențiale ale domeniului Realimob, apoi reîncărcați pagina — bannerul va apărea din
              nou;
            </li>
            <li>
              Utilizați setările browserului pentru a bloca sau șterge cookie-uri (vezi secțiunea 7);
            </li>
            <li>
              Contactați-ne la {CONTACT_EMAIL} dacă aveți nevoie de asistență.
            </li>
          </ol>

          <h2 className="text-xl font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            7. Cum puteți controla cookie-urile din browser
          </h2>
          <p>
            Majoritatea browserelor permit gestionarea cookie-urilor din setări (confidențialitate /
            securitate). Puteți șterge cookie-urile existente, bloca cookie-urile viitoare sau primi
            notificări înainte de stocare. Ghiduri utile:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <a
                href="https://www.allaboutcookies.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C25A2B] underline"
              >
                www.allaboutcookies.org
              </a>
            </li>
            <li>
              <a
                href="https://www.youronlinechoices.com/ro/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C25A2B] underline"
              >
                www.youronlinechoices.com/ro
              </a>
            </li>
          </ul>
          <p>
            Dezactivarea cookie-urilor esențiale poate împiedica autentificarea sau utilizarea
            anumitor funcții (publicare anunț, cont agent, favorite). Dezactivarea cookie-urilor
            opționale nu afectează funcționalitatea de bază a Platformei.
          </p>

          <h2 className="text-xl font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            8. Terți care pot plasa cookie-uri sau prelucra date prin tehnologii similare
          </h2>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong>Clerk Inc.</strong> — furnizor de autentificare și gestionare cont. Prelucrează
              date de identificare în scopul login-ului. Cookie-urile Clerk sunt esențiale. Datele pot
              fi transferate în afara SEE; Clerk aplică garanții contractuale (ex. Clauze Contractuale
              Standard UE).
            </li>
            <li>
              <strong>Google LLC</strong> — utilizat de agenții care conectează voluntar Google
              Calendar pentru programări. În acest flux se folosește cookie-ul{" "}
              <span className="font-mono">gc_oauth_state</span> și redirect către Google OAuth;
              prelucrarea ulterioară în Calendar este guvernată de politicile Google.
            </li>
            <li>
              <strong>Furnizori de infrastructură</strong> (găzduire, CDN, baze de date) pot procesa
              jurnale tehnice (adresă IP, timestamp) fără cookie-uri de marketing, în scopul securității
              și operării serviciului.
            </li>
          </ul>
          <p>
            Dacă vom integra servicii suplimentare (analiză trafic, rețele publicitare, widget-uri
            sociale), vom actualiza această politică și tabelul din secțiunea 5 înainte sau concomitent
            cu activarea, iar cookie-urile respective vor respecta consimțământul dvs. din banner.
          </p>

          <h2 className="text-xl font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            9. Transferuri internaționale
          </h2>
          <p>
            Unele furnizori (de ex. Clerk, Google) pot stoca sau prelucra date în Statele Unite ale
            Americii sau în alte țări din afara Spațiului Economic European. În astfel de cazuri,
            Societatea se bazează pe garanții recunoscute de GDPR (decizii de adecvare, Clauze
            Contractuale Standard, măsuri suplimentare), conform descrierilor din{" "}
            <Link href="/politica-de-confidentialitate" className="text-[#C25A2B] underline">
              Politica de Confidențialitate
            </Link>
            .
          </p>

          <h2 className="text-xl font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            10. Perioada de stocare
          </h2>
          <p>
            Cookie-urile de sesiune expiră la închiderea browserului. Cookie-urile persistente și
            intrările din localStorage rămân până la expirarea termenului indicat de furnizor sau până
            le ștergeți dvs. Preferințele de consimțământ sunt păstrate până le modificați sau le
            ștergeți. Cookie-urile de analiză, când vor fi utilizate, nu vor depăși în mod obișnuit 24
            de luni, cu excepția cazului în care legislația sau furnizorul impune alt termen; veți fi
            informat prin actualizarea acestei politici.
          </p>

          <h2 className="text-xl font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            11. Drepturile persoanelor vizate
          </h2>
          <p>
            În legătură cu datele prelucrate prin cookie-uri și tehnologii similare, beneficiați de
            drepturile prevăzute de GDPR: acces, rectificare, ștergere, restricționare, portabilitate
            (unde e aplicabil), opoziție și retragerea consimțământului pentru prelucrările bazate pe
            consimțământ.
          </p>
          <p>
            Pentru exercitarea drepturilor, contactați-ne la {CONTACT_EMAIL}. De asemenea, aveți
            dreptul de a depune o plângere la ANSPDCP: B-dul G-ral. Gheorghe Magheru 28-30, Sector 1,
            010336 București,{" "}
            <a
              href="mailto:anspdcp@dataprotection.ro"
              className="text-[#C25A2B] underline"
            >
              anspdcp@dataprotection.ro
            </a>
            ,{" "}
            <a
              href="https://www.dataprotection.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C25A2B] underline"
            >
              www.dataprotection.ro
            </a>
            .
          </p>
          <p>
            Detalii suplimentare despre drepturi și modalități de exercitare se regăsesc în{" "}
            <Link href="/politica-de-confidentialitate" className="text-[#C25A2B] underline">
              Politica de Confidențialitate
            </Link>
            .
          </p>

          <h2 className="text-xl font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            12. Securitate
          </h2>
          <p>
            Cookie-urile esențiale de autentificare sunt transmise, de regulă, prin conexiuni
            criptate (HTTPS). Nu stocați parole în cookie-uri locale și păstrați dispozitivul
            securizat. Societatea implementează măsuri tehnice și organizatorice rezonabile pentru a
            proteja datele prelucrate prin Platformă.
          </p>

          <h2 className="text-xl font-bold pt-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            13. Modificări ale acestei politici
          </h2>
          <p>
            Putem actualiza periodic această Politică Cookie (de ex. la introducerea unor noi
            tehnologii sau la modificări legislative). Data ultimei actualizări este afișată la
            începutul documentului. Vă încurajăm să consultați periodic această pagină. Modificări
            substanțiale pot fi comunicate și prin banner sau notificare pe Platformă.
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            {COMPANY} · Nr. Registrul Comerțului: {REG_COM} · CUI: {CUI}
            <br />
            Documente legale:{" "}
            <Link href="/termeni-si-conditii" className="text-[#C25A2B] underline">
              Termeni și condiții
            </Link>
            {" · "}
            <Link href="/politica-de-confidentialitate" className="text-[#C25A2B] underline">
              Politica de confidențialitate
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
