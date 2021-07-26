/**This Javascript file is meant for the portfolio to be built off of the
Github API and output the information as the Github portfolio in "cards" **/
var TxtRotate = function(el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = '';
  this.tick();
  this.isDeleting = false;
};

TxtRotate.prototype.tick = function() {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }

  this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

  var that = this;
  var delta = 300 - Math.random() * 100;

  if (this.isDeleting) { delta /= 2; }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function() {
    that.tick();
  }, delta);
};

window.onload = function() {
  var elements = document.getElementsByClassName('txt-rotate');
  for (var i=0; i<elements.length; i++) {
    var toRotate = elements[i].getAttribute('data-rotate');
    var period = elements[i].getAttribute('data-period');
    if (toRotate) {
      new TxtRotate(elements[i], JSON.parse(toRotate), period);
    }
  }
  // INJECT CSS
  var css = document.createElement("style");
  css.type = "text/css";
  css.innerHTML = ".txt-rotate > .wrap { border-right: 0.08em solid #666 }";
  document.body.appendChild(css);
};
      async function loadProjects(){
        const apiRoot ="https://api.github.com/users/jegraham/repos"
        const url = apiRoot;

        getList = async (limit) => {
            const response = await fetch(url,
                {
                    headers: {
                        authorization: "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"
                    }
                }
            );
            const data = await response.json();
            return data
        }

        const data = await getList(9);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET',url,true);

        xmlhttp.onload = function() {
        const data = JSON.parse(this.response);

        if(xmlhttp.readyState ===4 && xmlhttp.status ===200){
            var projects = JSON.parse(xmlhttp.responseText);
            var portfolio = "<div style='display: flex; flex-wrap:wrap; justify-content:center;'>";

            for (i = 0; i < projects.length; i++){
                portfolio = portfolio+ "<div class='card'>";
                portfolio = portfolio+ "<img  class='card-img-top' src="+ data[i].homepage+" alt="+ data[i].name +">";
                portfolio = portfolio+ "<div class='card-body'>";
                portfolio = portfolio+ "<a href=https://github.com/"+ data[i].full_name +"><h1 class='card-title'> "+ data[i].name +" </h1></a>";
                portfolio = portfolio+ "<p class='card-text'>" + data[i].description+ "</p>";
                //portfolio = portfolio+ "<p> Tags: more info to come</p>";
                portfolio = portfolio+ "</div></div>";
            }
            portfolio = portfolio+ "</div>";
            document.getElementById("projectinfo").innerHTML = portfolio;

        }
        };
            xmlhttp.send();
        }
        window.onload = function(){
          loadProjects();
    }

