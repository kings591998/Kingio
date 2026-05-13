const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.generateContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'يجب الدخول');
  const config = await admin.firestore().collection('ai_configs').doc('instructions').get();
  const prompt = config.exists ? config.data().prompt : '';
  const tone = config.exists ? config.data().tone : 'professional';

  // 🚨 ضع مفتاحك الحقيقي هنا عبر: firebase functions:config:set openai.key="sk-..."
  const KEY = functions.config().openai.key;
  if (!KEY) throw new functions.https.HttpsError('failed-precondition', 'لم يُضبط المفتاح');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: `${prompt}\n\nالموضوع: ${data.topic}. النبرة: ${tone}` }],
      temperature: 0.7
    })
  });
  const json = await res.json();
  if (!res.ok) throw new functions.https.HttpsError('internal', json.error?.message || 'خطأ');
  return { content: json.choices[0].message.content };
});
