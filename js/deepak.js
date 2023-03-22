function wordCloud(selector) {
  //Construct the word cloud's SVG element
  var wordCloudSVG = d3
    .select(selector)
    .append("svg")
    .attr("width", "100%")
    .attr("height", 280)
    .append("g")
    .attr("id", "words")
    .attr("transform", function () {
      return "translate(" + 500 + "," + 150 + ")";
    });

  //Draw the word cloud
  function draw(words) {
    var cloud = wordCloudSVG.selectAll("g text").data(words, function (d) {
      return d.text;
    });

    //Entering words
    cloud
      .enter()
      .append("text")
      .attr("id", function (d) {
        return d.text;
      })
      .style("font-family", "Gentium Book Plus")
      .style("fill", "#4C4C9D")
      .attr("text-anchor", "middle")
      .attr("font-size", function (d) {
        return d.size + "px";
      })
      .attr("transform", function (d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function (d) {
        return d.text;
      })
      .on("mouseover", function (event, d) {
        updateHoverSection(event.books.length);
      })
      .on("mouseleave", function (event, d) {
        hideHoverBox();
      })
      .on("click", function (event, d) {
        updateBookTitlesBelowWordCloud(event.books, event.text, 6);
        updateWordColors();
        d3.select(this).style("fill", "red");
      });

    //Entering and existing words
    cloud
      .transition()
      .duration(600)
      .style("font-size", function (de) {
        return de.size + "px";
      })
      .attr("transform", function (de) {
        return "translate(" + [de.x, de.y] + ")rotate(" + de.rotate + ")";
      })
      .style("fill-opacity", 1);

    //Exiting words
    cloud
      .exit()
      .transition()
      .duration(200)
      .style("fill-opacity", 1e-6)
      .attr("font-size", 1)
      .remove();
  }

  //Use the module pattern to encapsulate the visualisation code. We'll
  // expose only the parts that need to be public.
  return {
    //Recompute the word cloud for a new set of words. This method will
    // asycnhronously call draw when the layout has been computed.
    //The outside world will need to call this function, so make it part
    // of the wordCloud return value.
    update: function (words) {
      d3.layout
        .cloud()
        .size([900, 300])
        .words(words)
        .padding(5)
        .rotate(function () {
          return 0;
        })
        .font("Impact")
        .fontSize(function (d) {
          return d.size;
        })
        .on("end", draw)
        .start();
    },
  };
}

function prepareWordCloudData() {
  var newWordCloudData = [...wordCloudData];
  for (var i = 0; i < newWordCloudData.length; i++) {
    newWordCloudData[i].size = 20 + (newWordCloudData[i].size / 100) * 200;
  }
  return newWordCloudData;
}

async function showNewWords(vis) {
  vis.update(await prepareWordCloudData());
}

var myWordCloud = wordCloud("#titleWordCloud");

// Start cycling through the demo data
showNewWords(myWordCloud);

function updateHoverSection(text) {
  var hoverBox = document.getElementById("hoverBox");
  var hoverText = document.getElementById("onHoverText");
  hoverBox.style.display = "block";
  hoverText.innerHTML = text;
}

function hideHoverBox() {
  var hoverBox = document.getElementById("hoverBox");
  hoverBox.style.display = "none";
}

var wordCloud = document.getElementById("titleWordCloud");
wordCloud.addEventListener("mousemove", function (e) {
  var hoverBox = document.getElementById("hoverBox");
  hoverBox.style.left = `${e.clientX + 8}px`;
  hoverBox.style.top = `${e.clientY + 8}px`;
});

var currentBookList, currentWord;

function updateBookTitlesBelowWordCloud(bookList, word, count) {
  document.getElementById("bookListTitleWord").innerHTML = word;
  currentBookList = [];
  currentBookList = JSON.parse(JSON.stringify(bookList));
  currentWord = word;
  let bookListLen = bookList.length;
  bookList.forEach((element) => {
    let bookID = element[0];
    element.push(allBookDetails[bookID].count);
  });
  bookList.sort(function (a, b) {
    return a[2] - b[2];
  });
  bookList.reverse();
  var tempArray = JSON.parse(JSON.stringify(bookList));
  tempArray = tempArray.splice(0, count);
  var bookTitlesDiv = document.getElementById("booksList");
  bookTitlesDiv.innerHTML = "";
  for (var i = 0; i < tempArray.length; i++) {
    bookTitlesDiv.innerHTML +=
      '<span style="background-color: rgba(255,0,0,' +
      (tempArray[i][2] == 1 ? 0.05 : Math.log(tempArray[i][2]) * 0.2) +
      ')" onmouseenter="bookListHoverEvent(event)" id="' +
      tempArray[i][0] +
      '" class="bookTitle" data-bookId="' +
      tempArray[i][0] +
      '">' +
      boldString(tempArray[i][1], word) +
      "</span>";
  }
  if (tempArray.length < bookListLen) {
    var containerBtn = document.getElementById("booksListContainerBtn");
    containerBtn.style.display = null;
    containerBtn.innerHTML = `<a onclick="loadAllBooks()">View ${
      bookListLen - tempArray.length
    } more book titles</a>`;
  }
}

function loadAllBooks() {
  updateBookTitlesBelowWordCloud(
    currentBookList,
    currentWord,
    currentBookList.length
  );
  document.getElementById("booksListContainerBtn").style.display = "none";
}

function bookListHoverEvent(event) {
  const template = document.getElementById("bookListHoverBox");
  const bookId = event.srcElement.dataset.bookid;

  let statesCount = findItemCountArray(allBookDetails[bookId].states);
  statesCount.sort(function (a, b) {
    return a[1] - b[1];
  });
  statesCount.reverse();

  var bookTitle = document.getElementById("bookListTitle");
  bookTitle.innerHTML = allBookDetails[bookId].bookName;
  var authorName = document.getElementById("bookListAuthor");
  authorName.innerHTML = allBookDetails[bookId].author;
  var bannedCount = document.getElementById("bookListBannedCount");
  bannedCount.innerHTML =
    allBookDetails[bookId].count +
    (allBookDetails[bookId].count > 1 ? " districts" : " district");
  var bannedCountLine = document.getElementById("bookListBannedCountLine");
  bannedCountLine.style.backgroundColor =
    event.srcElement.style.backgroundColor;
  var bannedCount = document.getElementById("bookListPlaceTableContent");
  bannedCount.innerHTML = "";
  statesCount.forEach((element) => {
    let bars = "▮";
    let i = 1;
    while (i < element[1]) {
      bars += "▮";
      i++;
    }
    bannedCount.innerHTML += `<tr><td class="stateName">${element[0]}</td><td>${element[1]}<span class="countBar">${bars}</span></td></tr>`;
  });

  if (!event.srcElement._tippy) {
    tippy(event.srcElement, {
      content: template.innerHTML,
      allowHTML: true,
      interactive: true,
      theme: "light",
      // trigger: "click",
    });
    event.srcElement._tippy.show();
  }
}

function boldString(str, query) {
  const n = str.toUpperCase();
  const q = query.toUpperCase();
  const x = n.indexOf(q);
  if (!q || x === -1) {
    return str; // bail early
  }
  const l = q.length;
  return (
    str.substr(0, x) + "<b>" + str.substr(x, l) + "</b>" + str.substr(x + l)
  );
}

function updateWordColors() {
  var wordCloudSVG = d3
    .select("#titleWordCloud")
    .select("svg")
    .select("g")
    .selectAll("text");
  wordCloudSVG.style("fill", "grey");
}

function updateGirlWordColor() {
  var wordCloudSVG = d3
    .select("#titleWordCloud")
    .select("svg")
    .select("g")
    .select("#girl");
  wordCloudSVG.style("fill", "red");
}

function wordCloudInit() {
  updateBookTitlesBelowWordCloud(
    wordCloudData[1].books,
    wordCloudData[1].text,
    6
  );
  updateWordColors();
  updateGirlWordColor();
  searchList();
}

function searchList() {
  var bookDetailsSearchArray = Object.values(allBookDetails);
  bookDetailsSearchArray.sort(function (a, b) {
    return a.count - b.count;
  });
  bookDetailsSearchArray.reverse();
  bookDetailsSearchArray.forEach((element) => addCountSymbol(element));
  function addCountSymbol(element) {
    let bars = "▮";
    let i = 1;
    while (i < element.count) {
      bars += "▮";
      i++;
    }
    element.countText = bars;

    let j = 0;
    let districtSpans =
      '<p class="bannedIn">Banned in ' + element.count + " districts</p>";
    let numberOfStates = element.states.length;
    let tempStatesContainer = {};
    while (j < numberOfStates) {
      if (tempStatesContainer.hasOwnProperty(element.states[j])) {
        tempStatesContainer[element.states[j]].push(element.districts[j]);
      } else {
        tempStatesContainer[element.states[j]] = [];
        tempStatesContainer[element.states[j]].push(element.districts[j]);
      }
      j++;
    }
    let states = Object.keys(tempStatesContainer);
    let newStates = [];
    for (var k = 0; k < states.length; k++) {
      let districts = tempStatesContainer[states[k]];
      newStates.push([states[k], districts.length]);
    }
    newStates.sort(function (a, b) {
      return a[1] - b[1];
    });
    newStates.reverse();
    for (var k = 0; k < newStates.length; k++) {
      let districts = tempStatesContainer[newStates[k][0]];
      districtSpans +=
        '<div class="stateContainer"><div class="stateNameDiv"><p class="stateName">' +
        newStates[k][0] +
        "(" +
        newStates[k][1] +
        ")" +
        "</p></div>";
      let districtContainer =
        '<div class="districtSpanDiv"><div class="districtSpans">';
      for (var l = 0; l < districts.length; l++) {
        districtContainer += "<span>" + districts[l] + "</span>";
      }
      districtContainer += "</div></div>";
      districtSpans += districtContainer;
      districtSpans += "</div>";
    }

    element.places = districtSpans;
  }
  var options = {
    valueNames: ["bookName", "author", "countText", "count", "places"],
    item: '<li class="ac"><div class="ac-header"><div class="ac-trigger"><div class = "line1"><h4 class="bookName"></h4><span id="countSection" class="countSection"><span class="countText"></span><span class="count"></span><span class="bannedSymbol">🚫</span></span></div><div class="line2"><p class="author"></p></div></div></div><div class="ac-panel"><div class="places"></div></div></li>',
  };

  var bookSearchList = new List(
    "bookSearchList",
    options,
    bookDetailsSearchArray
  );
  accordion();
}

// function removePaginationClick() {
//   var acc = document.getElementsByClassName("page");
//   var i;
//   console.log(acc);
//   for (i = 0; i < acc.length; i++) {
//     acc[i].href = "";
//     acc[i].addEventListener("click", function (event) {
//       console.log("clicked");
//       event.preventDefault();
//       setTimeout(accordion, 10);
//       setTimeout(removePaginationClick, 10);
//     });
//   }
// }

function accordion() {
  var acc = document.getElementsByClassName("ac-header");
  var i;

  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
      /* Toggle between adding and removing the "active" class,
      to highlight the button that controls the panel */
      this.classList.toggle("active");

      /* Toggle between hiding and showing the active panel */
      var panel = this.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }
}

setTimeout(wordCloudInit, 50);

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  };
}

function findItemCountArray(array) {
  const count = {};
  const result = [];

  array.forEach((item) => {
    if (count[item]) {
      count[item] += 1;
      return;
    }
    count[item] = 1;
  });

  for (let prop in count) {
    result.push([prop, count[prop]]);
  }

  return result;
}
