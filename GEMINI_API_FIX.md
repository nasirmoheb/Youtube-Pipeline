# Gemini API Fix - Correct Usage

## 🔧 Issue
The code was using the wrong API pattern for `@google/genai` package (v1.29.0).

### Wrong Pattern (Old SDK)
```javascript
const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
const result = await model.generateContent(prompt);
```

### Correct Pattern (New SDK)
```javascript
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-exp',
  contents: prompt,
  config: { systemInstruction: '...' }
});
```

## ✅ Fixed Functions

### 1. generateText()
**Before:**
```javascript
export async function generateText(prompt, systemInstruction = '') {
  const model = ai.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    systemInstruction 
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

**After:**
```javascript
export async function generateText(prompt, systemInstruction = '') {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
    config: { systemInstruction }
  });
  return response.text;
}
```

### 2. generateBeatsStructured()
**Before:**
```javascript
const model = ai.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',
  systemInstruction: '...'
});
const result = await model.generateContent({
  contents: [{ parts: [{ text: prompt }] }],
  config: { ... }
});
const responseText = result.response.text();
```

**After:**
```javascript
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-exp',
  contents: prompt,
  config: {
    systemInstruction: '...',
    responseMimeType: 'application/json',
    responseSchema: { ... }
  }
});
const parsed = JSON.parse(response.text);
```

### 3. extractVoiceoverSegments()
**Before:**
```javascript
const model = ai.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',
  systemInstruction 
});
const result = await model.generateContent({
  contents: [{ parts: [{ text: prompt }] }],
  config: { ... }
});
```

**After:**
```javascript
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-exp',
  contents: prompt,
  config: {
    systemInstruction: '...',
    responseMimeType: 'application/json',
    responseSchema: { ... }
  }
});
```

### 4. generateImage()
**Before:**
```javascript
const model = ai.getGenerativeModel({ model: 'imagen-3.0-generate-001' });
const result = await model.generateContent(prompt);
return result.response.candidates[0].content.parts[0].inlineData.data;
```

**After:**
```javascript
const response = await ai.models.generateContent({
  model: 'imagen-3.0-generate-001',
  contents: prompt
});
return response.candidates[0].content.parts[0].inlineData.data;
```

### 5. generateVoiceoverAudio() ✅
**Already Correct:**
```javascript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-preview-tts',
  contents: [{ parts: [{ text }] }],
  config: {
    responseModalities: ['AUDIO'],
    speechConfig: { ... }
  }
});
```

## 📊 API Patterns

### Text Generation
```javascript
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-exp',
  contents: 'Your prompt here',
  config: {
    systemInstruction: 'You are a helpful assistant'
  }
});
console.log(response.text);
```

### Structured JSON Output
```javascript
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-exp',
  contents: 'Your prompt here',
  config: {
    systemInstruction: 'You are a JSON generator',
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'OBJECT',
      properties: {
        items: {
          type: 'ARRAY',
          items: { type: 'STRING' }
        }
      },
      required: ['items']
    }
  }
});
const data = JSON.parse(response.text);
```

### Audio Generation (TTS)
```javascript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-preview-tts',
  contents: [{ parts: [{ text: 'Hello world' }] }],
  config: {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: 'Kore' }
      }
    }
  }
});
const audioData = response.candidates[0].content.parts[0].inlineData.data;
const audioBuffer = Buffer.from(audioData, 'base64');
```

### Image Generation
```javascript
const response = await ai.models.generateContent({
  model: 'imagen-3.0-generate-001',
  contents: 'A beautiful sunset over mountains'
});
const imageData = response.candidates[0].content.parts[0].inlineData.data;
```

## 🔑 Key Differences

| Old SDK | New SDK |
|---------|---------|
| `ai.getGenerativeModel()` | `ai.models.generateContent()` |
| `result.response.text()` | `response.text` |
| Two-step process | Single call |
| `contents: [{ parts: [{ text }] }]` | `contents: text` (simplified) |

## ✅ All Functions Updated

- [x] generateText()
- [x] generateVoiceoverAudio() (was already correct)
- [x] generateImage()
- [x] generateBeatsStructured()
- [x] extractVoiceoverSegments()

## 🧪 Testing

After this fix, all functions should work correctly:

```bash
# Restart backend
cd backend
npm start

# Test each function:
# 1. Step 2: Generate summary (generateText)
# 2. Step 4: Extract segments (extractVoiceoverSegments)
# 3. Step 4: Generate voiceover (generateVoiceoverAudio)
# 4. Step 5: Generate beats (generateBeatsStructured)
```

## 📚 Reference

Official documentation: https://ai.google.dev/gemini-api/docs/quickstart?lang=node

Example from docs:
```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "Hello there",
  config: {
    systemInstruction: "You are a cat. Your name is Neko.",
  },
});

console.log(response.text);
```

---

**Status:** ✅ FIXED

All functions now use the correct `@google/genai` v1.29.0 API pattern.
