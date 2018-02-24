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
    if (team.team_number == undefined) {
        document.getElementById("teamheadline").innerHTML = "Error: Team not found";
        document.getElementById("teamheadline").style.color = "red";
        return false;
    }
    var events = await tba.getEventsForTeam(team);
    var date = new Date();
    document.title = "FRC Pit Assistant - " + team.nickname;
    document.getElementById("teamheadline").innerHTML = team.team_number + " " + team.nickname;
    document.getElementById("eventinput").innerHTML = "";
    var eventselected = -1;
    var eventsThisYear = 0;
    for (i in events) {
        if (parseInt(events[i].key.substring(0, 4)) === date.getFullYear()) {
            $('#eventinput').append($('<option>', {
                value: events[i].first_event_code,
                text: events[i].name + " (" + events[i].first_event_code + ")"
            }));
            if (events[i].first_event_code === getQueryVariable("event")) {
                eventselected = i;
            }
            eventsThisYear++;
        }
    }
    if (eventselected == -1 && eventsThisYear > 0) {
        eventselected = events.length - eventsThisYear;
    }
    $('#eventinput option[value="' + getQueryVariable("event") + '"]').attr("selected", true);
    if (eventselected > -1 && events[eventselected].webcasts != undefined && events[eventselected].webcasts.length > 0 && events[eventselected].webcasts[events[eventselected].webcasts.length - 1].type === "twitch") {
        new Twitch.Embed("stream", {
            width: 1067,
            height: 600,
            layout: "video",
            channel: events[eventselected].webcasts[events[eventselected].webcasts.length - 1].channel
        });
    }
    $('#avatar').attr("src", "https://frcavatars.herokuapp.com/get_image?team=" + team.team_number);
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
    $('#eventinput').change(function () {
        location.href = '?team=' + getQueryVariable("team") + '&event=' + $("#eventinput").val();
    });
    $("#eventinput").keyup(function(event) {
        if (event.keyCode === 13) {
            location.href = '?team=' + getQueryVariable("team") + '&event=' + $("#eventinput").val();
        }
    });

    await main();

    $('#loadinggif').hide()
}