var tba = new window.bluealliance("53QztSBkXCtjaAgV98kdm6VyhgD0wQy30RReogRjxs8hPpsqDD6qmxFyz71WELeC");

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return("");
}

function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}

async function main() {
    var team = await tba.getTeam(getQueryVariable("team"));
    var events = await tba.getEventsForTeam(team);
    document.title = "FRC Pit Assistant - " + team.nickname;
    document.getElementById("teamheadline").innerHTML = team.team_number + " " + team.nickname;
    for (i in events) {
        $('#eventinput').append($('<option>', {
            value: i,
            text: events[i].name + " (" + events[i].first_event_code + ")"
        }));
    }
    return true;
}

$('#loadinggif').show()

window.onload = async function() {
    $("#teaminput").val(getQueryVariable("team"));
    $('#teaminput').on('blur',function () {
        location.href = '?team=' + $("#teaminput").val();
    });
    $("#teaminput").keyup(function(event) {
        if (event.keyCode === 13) {
            location.href = '?team=' + $("#teaminput").val();
        }
    });

    await main();

    $('#loadinggif').hide()
}