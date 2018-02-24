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

function replaceChar(str, index, replacement) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}

async function pageInit() {
    var team = await tba.getTeam(getQueryVariable("team"));
    var events = await tba.getEventsForTeam(team);
    var date = new Date();
    var year = date.getFullYear()

    if (team.team_number == undefined) {
        document.getElementById("teamheadline").innerHTML = "Error: Team not found";
        document.getElementById("teamheadline").style.color = "red";
        return false;
    }
    document.getElementById("teamheadline").innerHTML = team.team_number + " " + team.nickname;
    document.getElementById("eventinput").innerHTML = "";
    var title = team.nickname + "'s Pit";
    if (team.nickname.slice(-1) === "s") {
        title = replaceChar(title, title.length - 5, " Pit ");
    }
    document.title = title;

    var eventselected = -1;
    var eventsThisYear = 0;
    if (getQueryVariable("year") != "") {
        year = getQueryVariable("year");
    }
    for (i in events) {
        if (parseInt(events[i].key.substring(0, 4)) === parseInt(year)) {
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

    var matches = await tba.getMatchesAtEvent(events[eventselected]);
    var teamMatches = [];
    var teamMatchAlliances = [];
    for (i in matches) {
        for (j in matches[i].alliances.blue.team_keys) {
            if (matches[i].alliances.blue.team_keys[j] == "frc" + team.team_number) {
                teamMatches.push(matches[i]);
                teamMatchAlliances.push("blue");
            }
        }
        for (j in matches[i].alliances.red.team_keys) {
            if (matches[i].alliances.red.team_keys[j] == "frc" + team.team_number) {
                teamMatches.push(matches[i]);
                teamMatchAlliances.push("red");
            }
        }
    }
    for (i in teamMatches) {
        var teams = [];
        if (teamMatchAlliances[i] == "blue") {
            for (j in teamMatches[i].alliances.blue.team_keys) {
                teams.push(teamMatches[i].alliances.blue.team_keys[j].substr(3));
            }
            for (j in teamMatches[i].alliances.red.team_keys) {
                teams.push(teamMatches[i].alliances.red.team_keys[j].substr(3));
            }
            $('#matches').append('<div class="match"><div class="matchnumberdiv"><p class="matchnumber">' + teamMatches[i].match_number + '</p></div><div class="bluealliancef"><p class="matchteam">' + teams[0] + '</p><p class="matchteam">' + teams[1] + '</p><p class="matchteam">' + teams[2] + '</p></div><div class="redallianceb"><p class="matchteam">' + teams[3] + '</p><p class="matchteam">' + teams[4] + '</p><p class="matchteam">' + teams[5] + '</p></div></div>');
        }
        if (teamMatchAlliances[i] == "red") {
            for (j in teamMatches[i].alliances.red.team_keys) {
                teams.push(teamMatches[i].alliances.red.team_keys[j].substr(3));
            }
            for (j in teamMatches[i].alliances.blue.team_keys) {
                teams.push(teamMatches[i].alliances.blue.team_keys[j].substr(3));
            }
            $('#matches').append('<div class="match"><div class="matchnumberdiv"><p class="matchnumber">' + teamMatches[i].match_number + '</p></div><div class="redalliancef"><p class="matchteam">' + teams[0] + '</p><p class="matchteam">' + teams[1] + '</p><p class="matchteam">' + teams[2] + '</p></div><div class="blueallianceb"><p class="matchteam">' + teams[3] + '</p><p class="matchteam">' + teams[4] + '</p><p class="matchteam">' + teams[5] + '</p></div></div>');
        }
    }
    if (teamMatches.length == 0) {
         $('#matches').append("<p>Sorry, this event's schedule is not yet available</p>")
    }

    var streamwidth = $(window).width() - Math.max(document.getElementById('teamheadline').offsetWidth, document.getElementById('matches').offsetWidth) - 200;
    if (streamwidth > 1067) { streamwidth = 1067 }
    if (eventselected > -1 && events[eventselected].webcasts != undefined && events[eventselected].webcasts.length > 0 && events[eventselected].webcasts[events[eventselected].webcasts.length - 1].type === "twitch") {
        $("#stream").width(streamwidth);
        $("#stream").height(Math.trunc(streamwidth / 1.77916667));
        var embed = new Twitch.Embed("stream", {
            width: "100%",
            height: "100%",
            layout: "video",
            channel: events[eventselected].webcasts[events[eventselected].webcasts.length - 1].channel
        });
    }

    $('#avatar').attr("src", "https://frcavatars.herokuapp.com/get_image?team=" + team.team_number);

    return true;
}

async function pagePeriodic() {
    var streamwidth = $(window).width() - document.getElementById('teamheadline').offsetWidth - 200;
    if (streamwidth > 1067) { streamwidth = 1067 }
    $("#stream").width(streamwidth);
    $("#stream").height(Math.trunc(streamwidth / 1.77916667));
}

$('#loadinggif').show()

window.onload = async function() {
    $("#teaminput").val(getQueryVariable("team"));
    var year = getQueryVariable("year");
    if (year == "") {
        year = new Date().getFullYear();
    }
    $('#teaminput').on('blur',function () {
        location.href = '?team=' + $("#teaminput").val() + '&year=' + year;
    });
    $("#teaminput").keyup(function(event) {
        if (event.keyCode === 13) {
            location.href = '?team=' + $("#teaminput").val() + '&year=' + year;
        }
    });
    $('#eventinput').change(function () {
        location.href = '?team=' + getQueryVariable("team") + '&event=' + $("#eventinput").val() + '&year=' + year;
    });
    $("#eventinput").keyup(function(event) {
        if (event.keyCode === 13) {
            location.href = '?team=' + getQueryVariable("team") + '&event=' + $("#eventinput").val() + '&year=' + year;
        }
    });

    await pageInit();
    $('#loadinggif').hide()
    setInterval(pagePeriodic, 20);
}