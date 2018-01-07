$(document).ready(function() {
    if($('body').hasClass("dashboard")) {
        var wrapper_g         = $(".input_fields_wrap");
        var add_button_g      = $(".add_field_button");
        var y = 1;
        $(add_button_g).click(function(e){
            e.preventDefault();
                y++;
                var newRow = `<div class="form-group row">
                                <label for="inputPeopleCount` + y + `" class="col-2 col-form-label">Ilość osób:</label>
                                <div class="col-2">
                                    <input name="peopleCount[]" type="number" id="inputPeopleCount` + y + `" class="form-control" placeholder="Ilość osób" required>
                                </div>
                                <label for="inputDiscount` + y + `" class="col-2 col-form-label">Przecena:</label>
                                <div class="col-2">
                                    <input name="discount[]" type="number" id="inputDiscount` + y + `" class="form-control discount" placeholder="Przecena (%)" required>
                                </div>
                                <p class="col-1">
                                </p>
                                <div class="col-1">
                                    <a href="#" class="btn btn-danger remove_field_g" role="button">Usuń</a>
                                </div>
                            </div>`
                $(wrapper_g).append(newRow);
                $(".form-group .discount").last().on("change", countDiscount);
        });
        $(wrapper_g).on("click",".remove_field_g", function(e){
            e.preventDefault(); $(this).parent('div').parent('div').remove(); y--;
        })

        function countDiscount() {
            var inputDiscount = $($(this) ).val();
            var startPrice = $( "#inputPrice" ).val();
            if(inputDiscount != "" && startPrice != "") {
                let discount = startPrice - startPrice * (inputDiscount / 100);
                $(this).parent().parent().find("p").html(discount);
            }
        }

        function run() {
            $( ".form-group .discount" ).on("change", countDiscount);
        }

        run();

        var wrapper_bodyparts         = $(".bodypart_input_fields_wrap");
        var add_button_bodypart      = $(".add_bodypart_button");
        var x = 0;
        $(add_button_bodypart).click(function(e){
            e.preventDefault();
                x++;
                var newRow = `<div class="form-group row">
                                <label for="bodypart` + x + `" class="col-2 col-form-label">Część ciała:</label>
                                <div class="col-9">
                                    <input name="bodyparts[]" type="text" id="bodypart` + y + `" class="form-control" placeholder="Część ciała" required>
                                </div>
                                <div class="col-1">
                                    <a href="#" class="btn btn-danger remove_field_g" role="button">Usuń</a>
                                </div>
                            </div>`
                $(wrapper_bodyparts).append(newRow);
        });
        $(wrapper_bodyparts).on("click",".remove_field_g", function(e){
            e.preventDefault(); $(this).parent('div').parent('div').remove(); x--;
        });

        /*$("#submit").click(function() {
            $("div .alert").remove();
            $.post("http://localhost:3000/procedures/addProcedure", $(".dashboard form").serialize(), function(data){
                if(data[0].value === 0) {
                    for(let i = 1; i < data.length; i++) {
                        let toAppend = `<div class="alert alert-danger">` + data[i].msg + `</div>`;
                        $(".container").last().prepend(toAppend);
                    }
                } else if(data[0].value === 1){
                    for(let i = 1; i < data.length; i++) {
                        let toAppend = `<div class="alert alert-success">` + data[i].msg + `</div>`;
                        $(".container").last().prepend(toAppend);
                        $(".container form input", ".container form textarea").val('');
                    }
                }      
            });
        });*/

        $("#moj-form").submit(function(e) {
            e.preventDefault();    
            var formData = new FormData(this);
            $("div .alert").remove();
            $.ajax({
                url: "http://localhost:3000/procedures/addProcedure",
                type: 'POST',
                data: formData,
                success: function (data) {
                    if(data[0].value === 0) {
                        for(let i = 1; i < data.length; i++) {
                            let toAppend = `<div class="alert alert-danger">` + data[i].msg + `</div>`;
                            $(".container").last().prepend(toAppend);
                        }
                    } else if(data[0].value === 1){
                        for(let i = 1; i < data.length; i++) {
                            let toAppend = `<div class="alert alert-success">` + data[i].msg + `</div>`;
                            $(".container").last().prepend(toAppend);
                            $(".container form input", ".container form textarea").val('');
                        }
                    }      
                },
                cache: false,
                contentType: false,
                processData: false
            });
        });

    } else if ($('body').hasClass("procedures")) {
        $.get('http://localhost:3000/procedures/proceduresInfo', function(data) {
            for(let i = 0; i < data.length; i++) {
                let newProcedureLink = `<li><a href=/procedureInfo.html?idProcedure=` + data[i]._id + `>` + data[i].title + `</a></li>`;
                $(".procedures-list").append(newProcedureLink);
            }
        })
    } else if ($('body').hasClass("procedure-info")) {
        let idProcedure = getUrlParameter('idProcedure');
        let linkToProcedure = "http://localhost:3000/procedures/procedureInfo/" + idProcedure;
        $.get(linkToProcedure, function(data) {
            $(".procedure-title").html(data.procedure.title);
            $(".procedure-desc").html(data.procedure.description);
            $(".procedure-img").attr('src', "http://localhost:3000/procedures/procedurePhoto/" + data.procedure.picture)
            if(data.procedure.isCurrent) {
                let toAppend = `<form action="http://localhost:3000/procedures/stopProcedure/` + data.procedure._id + `" method="POST">
                                    <button class="btn btn-lg btn-primary btn-block" type="submit">Zatrzymaj promocje</button>
                                </form>`
                $(".container").last().append(toAppend);
            }
            if(data.clients.length) {
                let toAppend = `<h2>Klienci</h2><br>`
                $(".container").last().append(toAppend);
                data.clients.forEach(function(client) {
                    let bodyparts = ``;
                    for(let i = 0; i<client.bodyparts.length; i++) {
                        bodyparts += client.bodyparts[i] + `; `;
                    }
                    let toAppend = `<div class="client-info"
                                    <p><b>Imie: </b>` + client.name + `</p>
                                    <p><b>Nazwisko: </b>` + client.surname + `</p>
                                    <p><b>Miasto: </b>` + client.city + `</p>
                                    <p><b>Adres: </b>` + client.address + `</p>
                                    <p><b>Kod pocztowy: </b>` + client.postcode + `</p>
                                    <p><b>Email: </b>` + client.email + `</p>
                                    <p><b>Numer telefonu: </b>` + client.phoneNumber + `</p>
                                    <p><b>Wybrane części ciała: </b>` + bodyparts + `</p>
                                    <p><b>Zdjęcie: </b></p>
                                    <img src="http://localhost:3000/procedures/clientPhoto/` + client.picture +`"></div>`;
                    $(".container").last().append(toAppend);
                }, this);
            }
        });
    } else if ($('body').hasClass("client")) {
        $.get("http://localhost:3000/procedures/getCurrentProcedure", function(data) {
            $(".procedure-title").html(data.procedure.title);
            $(".procedure-desc").html(data.procedure.description);
            $(".procedure-img").attr('src', "http://localhost:3000/procedures/procedurePhoto/" + data.procedure.picture)
            if(data.procedure.isCurrent) {
                let checkBoxes = `<div class="form-group row justify-content-center">
                <fieldset>`;
                for(let i = 0; i < data.procedure.bodyparts.length; i++) {
                    checkBoxes += ` <div>
                                    <input type="checkbox" id="` + data.procedure.bodyparts[i] + `" name="bodyparts" value="` + data.procedure.bodyparts[i] + `">
                                    <label class="col-2 col-form-label" for="` + data.procedure.bodyparts[i] + `">` + data.procedure.bodyparts[i] + `</label>
                                    </div>`
                }
                checkBoxes += `</fieldset></div>`
                let toAppend = ` <p class="peopleCount"><b>ILOŚĆ OBECNIE ZAPISANYCH OSÓB: </b>` + data.peopleCount + ` </br><b>AKTUALNA CENA: </b>` + data.threshold.price + `</p>
                <form class="form-signin" id="client-form" enctype="multipart/form-data">
                <div class="form-group row justify-content-center">
                <label for="inputName" class="col-2 col-form-label">Imię:</label>
                <input name="inputName" type="text" id="inputName" class="form-control col-5" placeholder="Imię" required autofocus>
                </div>
                <div class="form-group row justify-content-center">
                <label for="inputSurname" class="col-2 col-form-label">Nazwisko:</label>
                <input name="inputSurname" type="text" id="inputSurname" class="form-control col-5" placeholder="Nazwisko" required>
                </div>
                <div class="form-group row justify-content-center">
                <label for="inputCity" class="col-2 col-form-label">Miasto:</label>
                <input name="inputCity" type="text" id="inputCity" class="form-control col-5" placeholder="Miasto" required>
                </div>
                <div class="form-group row justify-content-center">
                <label for="inputAddress" class="col-2 col-form-label">Adres:</label>
                <input name="inputAddress" type="text" id="inputAddress" class="form-control col-5" placeholder="Adres" required>
                </div>
                <div class="form-group row justify-content-center">
                <label for="inputPostcode" class="col-2 col-form-label">Kod pocztowy:</label>
                <input name="inputPostcode" type="text" id="inputPostcode" class="form-control col-5" placeholder="Adres pocztowy" required>
                </div>
                <div class="form-group row justify-content-center">
                <label for="inputPicture" class="col-2 col-form-label">Zdjęcie:</label>
                <input name="inputPicture" type="file" id="inputPicture" class="form-control col-5" required>
                </div>
                <div class="form-group row justify-content-center">
                <label for="inputEmail" class="col-2 col-form-label">Email:</label>
                <input name="inputEmail" type="email" id="inputEmail" class="form-control col-5" placeholder="Email" required>
                </div>
                <div class="form-group row justify-content-center">
                <label for="inputPhoneNumber" class="col-2 col-form-label">Numer telefonu:</label>
                <input name="inputPhoneNumber" type="text" id="inputPhoneNumber" class="form-control col-5" placeholder="Numer telefonu" required>
                </div>
                <div class="row justify-content-center">
                <p>Wybierz interesujace Cię części ciała:</p>
                </div>
                ` + checkBoxes + `
                <div class="form-group row justify-content-center">
                <button class="btn btn-lg btn-primary btn-block col-4" id="clientSubmit" type="submit">Zapisz się</button>
                </div>
                                </form>
                                <div class="row justify-content-center" id="clientForm"></div>`
                $(".container").last().append(toAppend);
                $("#clientForm").jsSocials({
                    shares: ["email", "twitter", "facebook", "googleplus", "linkedin", "pinterest", "stumbleupon"]
                });
                $("#client-form").submit(function(e) {
                    e.preventDefault();
                    checked = $("input[type=checkbox]:checked").length;
                    
                    if(!checked) {
                        let toAppend = `<div class="form-group row justify-content-center alert alert-danger">Wybierz chociaż jedną część ciała!</div>`;
                        $(".container form div").last().before(toAppend);
                        return false;
                    } else {
                        var formData = new FormData(this);
                        $("div .alert").remove();
                        $.ajax({
                            url: 'http://localhost:3000/procedures/addClient/' + data.procedure._id,
                            type: 'POST',
                            data: formData,
                            success: function (data) {
                                if(data[0].value === 0) {
                                    for(let i = 1; i < data.length; i++) {
                                        let toAppend = `<div class="alert alert-danger">` + data[i].msg + `</div>`;
                                        $(".container").last().prepend(toAppend);
                                    }
                                } else if(data[0].value === 1){
                                    for(let i = 1; i < data.length; i++) {
                                        let toAppend = `<div class="alert alert-success">` + data[i].msg + `</div>`;
                                        $(".container").last().prepend(toAppend);
                                        console.log($("#client-form"))
                                        $("#client-form input").val('');
                                    }
                                    $.get("http://localhost:3000/procedures/getCurrentProcedure", function(data) {
                                        $(".peopleCount").html(`<b>ILOŚĆ OBECNIE ZAPISANYCH OSÓB: </b>` + data.peopleCount + ` <b>AKTUALNA CENA: </b>` + data.threshold.price);
                                    });
                                }      
                            },
                            cache: false,
                            contentType: false,
                            processData: false
                        });
                    }
                });
            }
        });
    } 

    function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
    
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
    
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };
});

function checkForMessages(data, container, style) {
    data.forEach(function(element) {
        $(container).append(`<div class="` + style + `">` + element + `</div>`);
    });
}

$(document).ready(function () {
    $('#clientSubmit').click(function() {
      checked = $("input[type=checkbox]:checked").length;

      if(!checked) {
        alert("You must check at least one checkbox.");
        return false;
      }

    });
});