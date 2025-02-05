const getKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["openai-key"], (result) => {
      if (result["openai-key"]) {
        const decodedKey = atob(result["openai-key"]);
        resolve(decodedKey);
      }
    });
  });
};

const sendMessage = (content) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0].id;

    chrome.tabs.sendMessage(
      activeTab,
      { message: 'inject', content },
      (response) => {
        if (response.status === 'failed') {
          console.log('injection failed.');
        }
      }
    );
  });
};

const generate = async (prompt) => {
  // Get your API key from storage
  const key = await getKey();
  const url = "https://api.openai.com/v1/completions";

  // Call completions endpoint
  const completionResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "text-davinci-002",
      prompt: prompt,
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  // Select the top choice and send back
  const completion = await completionResponse.json();
  return completion.choices.pop();
};

const generateCompletionAction = async (info) => {
  try {

    sendMessage('generating please wait...');

    const { selectionText } = info;
    const basePromptPrefix = `
    write me the full lore of the game with the style of GLaDOS from Aperture Science in portal 2 with the title below. Please make sure the lore of the game goes in-depth on the topic and shows that the writer did their research.

    Title:
      `;

    const baseCompletion = await generate(
      `${basePromptPrefix}${selectionText}`
    );

    // Add your second prompt here
    const secondPrompt = `
    Take the table of contents and title of the lore of the game below and generate the game lore written in with style of GLaDOS from Aperture Science in portal 2. Make it feel like a history. Don't just list the points. Go deep into each one. Explain why.

    Title: ${selectionText}
      
    Table of Contents: ${baseCompletion.text}
      
    Tweet:
      `;

    const secondPromptCompletion = await generate(secondPrompt);

      sendMessage(secondPromptCompletion.text);
  } catch (error) {
    console.log(error);

    sendMessage(error.toString());
  }
};

chrome.contextMenus.create({
  id: "context-run",
  title: "Generate lore game",
  contexts: ["selection"],
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);
