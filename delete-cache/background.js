chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "clean") {
    cleanBrowser(request.dataTypes, request.timeInterval, sendResponse);
    return true; // Indicate that we will send a response asynchronously
  }
});

function cleanBrowser(dataTypes, timeInterval, sendResponse) {
  let sinceTime = 0;
  const now = new Date().getTime();
  switch(timeInterval) {
    case 'hour': sinceTime = now - 60 * 60 * 1000; break;
    case 'day': sinceTime = now - 24 * 60 * 60 * 1000; break;
    case 'week': sinceTime = now - 7 * 24 * 60 * 60 * 1000; break;
    case 'month': sinceTime = now - 30 * 24 * 60 * 60 * 1000; break;
    case 'all': sinceTime = 0; break;
  }

  let downloadCountBefore = 0;
  let historyCountBefore = 0;

  // Count downloads and history items before cleaning
  Promise.all([
    new Promise(resolve => {
      if (dataTypes.downloads) {
        chrome.downloads.search({}, downloads => {
          downloadCountBefore = downloads.length;
          resolve();
        });
      } else {
        resolve();
      }
    }),
    new Promise(resolve => {
      if (dataTypes.history) {
        chrome.history.search({text: '', startTime: sinceTime, maxResults: 1000000}, historyItems => {
          historyCountBefore = historyItems.length;
          resolve();
        });
      } else {
        resolve();
      }
    })
  ]).then(() => {
    // Perform the actual cleaning
    chrome.browsingData.remove({
      "since": sinceTime
    }, dataTypes, () => {
      console.log('Cleaning completed');
      
      let cleanedTypes = Object.keys(dataTypes).filter(key => dataTypes[key]);
      let report = `Cleaned: ${cleanedTypes.join(", ")}`;

      // Count downloads and history items after cleaning
      Promise.all([
        new Promise(resolve => {
          if (dataTypes.downloads) {
            chrome.downloads.search({}, downloads => {
              let downloadsCleaned = downloadCountBefore - downloads.length;
              if (downloadsCleaned > 0) {
                report += `\nDownloads removed: ${downloadsCleaned}`;
              }
              resolve();
            });
          } else {
            resolve();
          }
        }),
        new Promise(resolve => {
          if (dataTypes.history) {
            chrome.history.search({text: '', startTime: sinceTime, maxResults: 1000000}, historyItems => {
              let historyCleaned = historyCountBefore - historyItems.length;
              if (historyCleaned > 0) {
                report += `\nHistory items removed: ${historyCleaned}`;
              }
              resolve();
            });
          } else {
            resolve();
          }
        })
      ]).then(() => {
        sendResponse({
          status: "Cleaning completed", 
          report: report
        });
      });
    });
  });
}