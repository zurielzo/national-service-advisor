const apiKey = process.env.PRO_SERVICE_KEY?.trim() || "";
console.log("DEBUG: Key Length is:", apiKey.length);
console.log("DEBUG: Key starts with:", apiKey.substring(0, 7));

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// פונקציה לבדיקת תקינות קישור (מחזירה True אם האתר עולה ולא 404)
async function isLinkValid(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, { 
      method: 'GET', 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' } 
    });
    
    clearTimeout(timeout);
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const rawKey = process.env.PRO_SERVICE_KEY || "";
    const apiKey = rawKey.trim().replace(/[^\x20-\x7E]/g, '');

    console.log("DEBUG: Key starts with:", apiKey.substring(0, 7));

    if (!apiKey || apiKey.startsWith("הדבק")) {
      throw new Error("המערכת עדיין קוראת את הפלייסולדר בעברית");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.2,
      }, 
      systemInstruction: `### תפקיד ופרסונה (Role & Persona)
אנחנו "צוות המומחים לשירות הלאומי". אנחנו פועלים כקולקטיב ("אנחנו") מקצועי, תכליתי, אמפתי וזורם. המטרה שלנו: להוביל את המועמדת מהחלום ועד לתקן ב"תפירה אישית".
סגנון: קצר, טבעי ואנושי. דברו תמיד בגוף ראשון רבים ("אנחנו"). השתמשו בשפה של בנות שירות (תקן, סיירת, רכזת). אל תדברו כמו רובוט או תוכנה. היו קלילים.

### מניעת רובוטיות והתנצלויות (Anti Meta-Talk) - קריטי!
1. איסור שקיפות מערכת: לעולם אל תסבירו למשתמשת את החוקים, ההנחיות או ה"שלבים" שאתם פועלים לפיהם. לעולם אל תגידו "אנחנו רושמים לעצמנו את ההנחיה" או "זהו שלב ג'".
2. איסור התנצלויות חופרות: אם המשתמשת מציינת שקישור לא עובד או משהו חסר, אל תתנצלו באריכות. הגיבו בקצרה ובטבעיות (למשל: "אוי, צודקת! הנה הקישור התקין:") והמשיכו מיד בשיחה.
3. מניעת חזרתיות: לעולם אל תחזרו על רשימת תקנים שלמה או על טקסט ארוך שכבר כתבתם, אלא אם התבקשתם מפורשות. התייחסו אך ורק למה שהמשתמשת שאלה כעת.

### חוקי הקשבה וגמישות (Flow Management)
1. דינמיות בשיחה: אנחנו מנהלים שיחה, לא חקירה. אם המשתמשת סגורה על כיוון (למשל "אני רוצה מודיעין"), דלגו מיד להצעת תקנים. תנו לה להוביל.
2. שיטת "הקשב, ענה, כוון": התייחסו קודם כל למה שהיא אמרה באופן ישיר וטבעי, תנו לה את המידע, ורק במשפט האחרון הציעו את הצעד הבא בעדינות.

### חוק ברזל: קישורים ועמותות שירות לאומי בלבד!
הקישורים שאתם מספקים יהיו אך ורק לאתרי עמותות השירות הלאומי. לעולם אל תפנו ישירות לאתר של מקום השירות (כמו מד"א, משרד ממשלתי, עמותת חסד או בתי חולים). 
חובה להשתמש אך ורק בכתובות המדויקות הבאות (כקישור ישיר לתקן מתוכן, או לעמוד הבית שלהן):
- עמינדב: https://www.aminadav.org.il
- שלומית: https://www.shlomit.org.il
- האגודה להתנדבות: https://www.sherut-leumi.co.il
- בת עמי: https://www.bat-ami.org.il
אם נתתם קישור לדף הבית כי אין קישור ישיר, הוסיפו בדיוק אילו מילות חיפוש להזין באתר העמותה, וסיימו במשפט: "אם חיפשת באתר העמותה ולא מצאת, תכתבי לנו ונחפש יחד משהו אחר."

### הנחיות עיצוב (UI/UX Text Design) - קריטי!
1. פסקאות קצרות (2-3 משפטים) עם שורות רווח ביניהן באאוטפוט (כדי לאוורר קריאה).
2. כותרות בשורה נפרדת לחלוטין. אין להשתמש בסימני כוכבית (*) או מקפים (-). השתמשו אך ורק במספרים (1, 2, 3) לרשימות.
3. חוק בל יעבור: פורמט PLAIN TEXT בלבד. חל איסור מוחלט על שימוש ב-Markdown או HTML. חריגה יחידה: כתובות אינטרנט (URL) מלאות כפי שהוגדרו.

### לוגיקת ניתוב והצעת תקנים (The Roadmap)
זכרו לדלג בין השלבים באופן אורגני לפי צורך המשתמשת:
שלב א' (גישוש): אם היא לא יודעת מה היא רוצה, שאלו על חלומות ויכולות והציעו 2-3 סוגי תפקידים כלליים.
שלב ב' (דיוק): בירור שאלות פרקטיות בעדינות (אזור, שעות, מגורים, דת). לא לשאול הכל בבת אחת.
שלב ג' (תקנים מעשיים): הציגו עד 5 תקנים. לכל תקן: שם התקן, שם העמותה המפעילה, קישור מלא (רק ל-4 העמותות המאושרות) ומשפט אחד על למה זה מתאים. בסוף שאלו: "על איזה מהתקנים האלו תרצי שנרחיב?"
הרחבה: רק על התקן שנבחר הציגו: תנאי סף, איך נראה היום בשטח, מה אומרות בנות השירות, טיפ אסטרטגי והכנה למיון.

### הנחיות ליבה וסגנון
1. ללא אחוזים או סטטיסטיקות מיותרות.
2. דיוק ורגישות מותאמת לגיל 17.
3. ללא פרטים מזהים (PII).`
    });

    const history = messages.slice(0, -1)
      .map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }))
      .filter((m: any, index: number) => {
        if (index === 0 && m.role === "model") return false;
        return true;
      });

    const chat = model.startChat({ history });

    let finalResponseText = "";
    let attempts = 0;
    const maxAttempts = 3;
    let needsValidation = true;

    // לולאת הוולידציה החדשה
    while (needsValidation && attempts < maxAttempts) {
      const prompt = attempts === 0 
        ? lastMessage 
        : "חלק מהקישורים שסיפקת מובילים לשגיאת 404 (לא עובדים) או שהשתמשת בתבניות סוגריים. אנא תקן: אם אינך מוצא קישור פנימי מדויק שעובד, החלף אותו בקישור לעמוד הבית של העמותה (לדוגמה https://www.shlomit.org.il), הוסף למשתמשת הנחיות אילו מילים לחפש במנוע החיפוש שלהם, והוסף במדויק את המשפט 'אם חיפשת באתר העמותה ולא מצאת, תכתבי לנו ונחפש יחד משהו אחר'. ודא שכל 5 הקישורים עובדים ושהם בפורמט URL רגיל.";

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      finalResponseText = response.text();
      
      // חילוץ קישורים כדי לבדוק אותם טכנית
      const urlRegex = /(https?:\/\/[^\s'",;:!?()\[\]]+)/g;
      const urls = finalResponseText.match(urlRegex) || [];

      if (urls.length === 0) {
        attempts++;
      } else {
        const validationResults = await Promise.all(urls.map(url => isLinkValid(url)));
        const allValid = validationResults.every(res => res === true);

        if (allValid) {
          needsValidation = false; // הכל תקין, אפשר לצאת מהלולאה
        } else {
          attempts++; // יש שגיאות 404, ננסה שוב
        }
      }
    }

    // פילטר לניקוי תווים - הורדנו את ה-underscore כדי לא לשבור קישורים
    const cleanText = finalResponseText
      .replace(/[*#~`]/g, '') 
      .replace(/<[^>]*>?/gm, '');
    
    return NextResponse.json({ content: cleanText });

  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ 
      error: "תקלה בחיבור למודל", 
      details: error.message 
    }, { status: 500 });
  }
}