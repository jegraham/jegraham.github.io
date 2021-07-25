
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

