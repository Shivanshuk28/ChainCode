import { request } from 'axios';
let data = JSON.stringify({
  "contents": [
    {
      "parts": [
        {
          "text": `return in one word Assess the algorithmic equivalence of the provided code snippets. Consider their data structures, techniques, and time complexities. Return 'true' if they are algorithmically same meaning after all the fuss they are similar at core, 'false' if they are not code 1:   def lengthOfLastWord(self, s: str) -> int:  print(len((s.split())[-1]))  code 2:${code 2}`
        }
      ]
    }
  ]
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAXP0d1YSWe4c99DvXouVobtpdOKGFaE4k',
  headers: { 
    'Content-Type': 'application/json'
  },
  data : data
};

request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});