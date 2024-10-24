/***********************************************************
    Polyfill for browsers that do not support requestIdleCallback
************************************************************/

if (!window.requestIdleCallback) {
  window.requestIdleCallback = function (callback, options) {
    var options = options || {};
    var relaxation = 1;
    var timeout = options.timeout || relaxation;
    var start = performance.now();
    return setTimeout(function () {
      callback({
        get didTimeout() {
          return options.timeout
            ? false
            : (performance.now() - start) - relaxation > timeout;
        },
        timeRemaining: function () {
          return Math.max(0, relaxation + (performance.now() - start));
        },
      });
    }, relaxation);
  };
}

/***********************************************************
    Utilities
************************************************************/

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

class Task {
  constructor(task) {
    let rejected = false;
    const { promise, resolve, reject } = Promise.withResolvers();
    this.#promise = promise;
    this.#reject = reject;
    if (!rejected) {
      task().then(resolve, reject);
    }
  }

  then(...args) {
    return this.#promise.then(...args);
  }

  cancel() {
    this.#reject(new Error("Canceled"));
  }

  #reject;
  #promise;
}

/***********************************************************
 	Search element
************************************************************/

class SearchElement extends HTMLElement {
  input;
  value;
  results;
  dropdown;
  inFlightPromise;
  debouncedOnInput;

  onInput = (e) => {
    this.value = this.input.value;

    if (this.value.length < 3) {
      this.dropdown.innerHTML = "Search products...";
    } else {
      this.fetchFromServer();
    }
  };

  fetchFromServer = async () => {
    if (this.inFlightPromise) this.inFlightPromise.cancel();

    this.dropdown.innerHTML = "Loading...";

    this.inFlightPromise = new Task(async () => {
      const res = await fetch(`/search/${this.value}`);
      if (!res.ok) return;
      this.results = await res.json();
      return this.results.data;
    });

    this.inFlightPromise.then((results) => {
      if (!results || results.length === 0) {
        this.dropdown.innerHTML = "No results found";
        return;
      }

      this.results = results;
      this.dropdown.innerHTML = this.results.map((r) =>
        `<a preload class="search-result hoverable" href="/product/${r.slug}">${r.name}</a>`
      ).join("");
      for (const link of this.dropdown.getElementsByTagName("a")) {
        morpher.registerLink(link);
        link.addEventListener("click", (e) => {
          this.dropdown.style.display = "none";
        });
      }
    }).catch((e) => {
      if (e.message === "Canceled") return;
      console.error("error fetching search results:", e);
    });
  };

  connectedCallback() {
    this.style.position = "relative";

    this.input = this.querySelector("input");

    console.log(this.querySelector("input"));

    this.debouncedOnInput = debounce(this.onInput);

    this.input.addEventListener("input", (e) => this.debouncedOnInput(e));

    document.body.shadowRoot.addEventListener("click", (e) => {
      if (!this.contains(e.target)) this.dropdown.style.display = "none";
    });

    this.input.addEventListener("focus", () => {
      this.dropdown.style.display = "block";
    });

    this.dropdown = document.createElement("div");
    this.dropdown.classList.add("search-dropdown");
    this.dropdown.innerHTML = "Search products...";
    this.appendChild(this.dropdown);
  }
}

if (!customElements.get("product-search")) {
  customElements.define("product-search", SearchElement);
}
