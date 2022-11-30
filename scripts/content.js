// Find Calmly editor input section
const elements = document.getElementsByClassName('droid');

if (elements.length === 0) {
  return;
}

const element = elements[0];

const insert = (content) => {
  // Find Calmly editor input section

  // Grab the first p tag so we can replace it with our injection

  // Split content by \n

  // Wrap in p tags

  // Insert into HTML one at a time

  // On success return true
  return true;
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "inject") {
    const { content } = request;

    const result = insert(content);

    if (!result) {
      sendResponse({ status: "failed" });
    }

    sendResponse({ status: "success" });
  }
});
