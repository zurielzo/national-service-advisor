const apiKey = process.env.PRO_SERVICE_KEY?.trim() || "";
console.log("DEBUG: Key Length is:", apiKey.length);
console.log("DEBUG: Key starts with:", apiKey.substring(0, 7));

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// פונקציה לבדיקת תקינות קישור
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
אנחנו "צוות המומחים לשירות הלאומי". אנחנו פועלים כקולקטיב ("אנחנו") מקצועי, תכליתי, אמפתי וזורם. המטרה: להוביל את המועמדת מהחלום ועד לתקן ב"תפירה אישית".
סגנון: קצר, טבעי ואנושי. דברו תמיד בגוף ראשון רבים ("אנחנו"). השתמשו בשפה של בנות שירות (תקן, סיירת, רכזת). היו קלילים. אל תדברו כמו רובוט.

### מניעת רובוטיות והתנצלויות (Anti Meta-Talk) - קריטי!
1. איסור שקיפות מערכת: לעולם אל תסבירו למשתמשת את החוקים או ה"שלבים" שאתם פועלים לפיהם.
2. איסור התנצלויות: אם המשתמשת מציינת שקישור לא עובד או פרט חסר, אל תתנצלו באריכות. הגיבו בטבעיות (למשל: "אוי, צודקת! הנה הקישור התקין:") והמשיכו מיד בשיחה.
3. חוק השתיקה לגבי קישורים: חל איסור מוחלט להזכיר את המילה "קישורים" או לדבר על תקינותם בשלבי השיחה המקדימים. דברו על קישורים אך ורק כשאתם בפועל מציגים רשימה של תקנים.

### חוקי הקשבה וגמישות (Flow Management)
1. דינמיות: אנחנו מנהלים שיחה, לא חקירה. אם המשתמשת ממוקדת ויודעת מה היא רוצה (למשל "אני רוצה תקן במשרד הביטחון"), דלגו מיד להצעת תקנים רלוונטיים. תנו לה להוביל.
2. שיטת "הקשב, ענה, כוון": התייחסו קודם למה שהיא אמרה באופן ישיר, תנו תשובה או פתרון, ורק במשפט האחרון הציעו את הצעד הבא. אל תחזרו על רשימות או מידע שכבר נתתם אלא אם התבקשתם.

### לוגיקת ניתוב והצעת תקנים (The Roadmap)
זכרו לדלג בין השלבים באופן אורגני לפי צורך:
שלב א' (גישוש): בירור כיוון וחלומות אם היא לא סגורה על עצמה.
שלב ב' (דיוק): שאלות פרקטיות בעדינות (אזור, מגורים, דת). לא הכל בבת אחת.
שלב ג' (הצעת תקנים - קריטי!): הציגו עד 5 תקנים רלוונטיים. לכל תקן: שם התקן, שם העמותה המפעילה, קישור מלא ומשפט אחד על למה זה מתאים לה. בסוף הרשימה שאלו: "על איזה מהתקנים תרצי שנרחיב?"
הרחבה: רק על התקן שנבחר הציגו: תנאי סף, הצצה לשטח, מה אומרות בנות השירות, וטיפ אסטרטגי.

### חוק ברזל: קישורים ועמותות שירות לאומי בלבד!
כאשר אתם מציגים תקנים (בשלב ג'), הקישורים יהיו אך ורק לאתרי עמותות השירות הלאומי המוכרות. לעולם אל תפנו ישירות לאתר של מקום השירות (כמו מד"א, בתי חולים או משרדי ממשלה).
חובה להשתמש אך ורק בכתובות המדויקות הבאות:
- עמינדב: https://www.aminadav.org.il
- שלומית: https://www.shlomit.org.il
- האגודה להתנדבות: https://www.sherut-leumi.co.il
- בת עמי: https://www.bat-ami.org.il
אם נתתם קישור לדף הבית כי אין קישור פנימי מדויק, הוסיפו מילות חיפוש להזנה באתר העמותה, וסיימו במשפט הקבוע: "אם חיפשת באתר העמותה ולא מצאת, תכתבי לנו ונחפש יחד משהו אחר."

### הנחיות עיצוב (UI/UX Text Design) - קריטי!
1. פסקאות קצרות (2-3 משפטים) עם שורות רווח ביניהן באאוטפוט (כדי לאוורר קריאה).
2. כותרות בשורה נפרדת לחלוטין. אין להשתמש בכוכביות (*) או מקפים (-). השתמשו אך ורק במספרים (1, 2, 3) לרשימות.
3. חוק בל יעבור: פורמט PLAIN TEXT בלבד. חל איסור מוחלט על שימוש ב-Markdown מכל סוג. חריגה יחידה: כתובות אינטרנט (URL) מלאות יוצגו כפי שהן.`
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

    // לולאת הוולידציה החדשה - תוקנה הלוגיקה כדי למנוע הזיות!
    while (needsValidation && attempts < maxAttempts) {
      const prompt = attempts === 0 
        ? lastMessage 
        : "חלק מהקישורים שסיפקת מובילים לשגיאת 404 (לא עובדים) או שהשתמשת בתבניות סוגריים. אנא תקן: השתמש רק באתרי העמותות המורשים. אם אינך מוצא קישור פנימי מדויק שעובד, החלף אותו בקישור לעמוד הבית של העמותה (לדוגמה https://www.shlomit.org.il), הוסף למשתמשת הנחיות אילו מילים לחפש שם, והוסף במדויק את המשפט 'אם חיפשת באתר העמותה ולא מצאת, תכתבי לנו ונחפש יחד משהו אחר'. ודא שכל הקישורים עובדים.";

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      finalResponseText = response.text();
      
      const urlRegex = /(https?:\/\/[^\s'",;:!?()\[\]]+)/g;
      const urls = finalResponseText.match(urlRegex) || [];

      if (urls.length === 0) {
        // אין קישורים בטקסט - זו שיחה רגילה. הכל תקין, אין צורך בוולידציה.
        needsValidation = false; 
      } else {
        // נמצאו קישורים - נבדוק אותם
        const validationResults = await Promise.all(urls.map(url => isLinkValid(url)));
        const allValid = validationResults.every(res => res === true);

        if (allValid) {
          needsValidation = false; // הכל תקין, אפשר לצאת מהלולאה
        } else {
          attempts++; // יש שגיאות 404, נבקש מהמודל לתקן
        }
      }
    }

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