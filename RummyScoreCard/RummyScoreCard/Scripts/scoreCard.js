function AddTableHeader() {
    var row = document.createElement("tr");
    var rounds = ["One 3", "Two 3's", "One 4", "Two 4's", "One 5", "Two 5's"];
    $(row).append('<td>' + "Player" + '</td>');
    for (var i in rounds) {
        $(row).append('<td>' + rounds[i] + '</td>');
    }
    $("#results-table").append(row);
}

function DisplayRoundScores(data) {
    AddTableHeader();
    for (var index = 0; index < data[0].scores().length; index++) {
        var row = document.createElement("tr");
        $(row).append('<td>' + data[index].scores()[index].split('-')[0] + '</td>'); //name
        for (var i in data) {
            //$("#data").append('<td>' + data[i].round + '</td>');
            //data[i].scores()[1].split('-')[1] = the actual score for the round
            //results-table = table name
            //$(row).append('<td>' + data[i].scores()[score] + '</td>');
            //6 rounds (0 - 5)
            
            $(row).append('<td>' + data[i].scores()[index].split('-')[1] + '</td>');

            
        }
        $("#results-table").append(row);
    }
    $("#header-scores-container").slideUp(400, function () {
        $("#previous-rounds").slideDown(400, function () { });
    });
}

function Game(round, scores) {
    var self = this;
    self.round = round;
    self.scores = ko.observableArray(scores);
}

function Player(name, roundScore) {
    var self = this;
    var total = 0;
    self.counter = ko.observable(0);
    self.name = name;
    self.roundScore = ko.observable(roundScore);
    self.score = ko.computed({
        read: function () {
            if (parseInt(self.roundScore(), 10) > 0) {
                total += parseInt(self.roundScore(), 10);
                self.counter(total);
                return self.counter();
            }
            else {
                //return total;
                return self.counter();
            }
        },
        write: function (value) {
            total = 0;
            self.counter(0);
        }
    });
}

function GetScoresForRound(players, index) {
    var arr = [];
    for (var i in players()) {
        arr.push(players()[i].name + "-" + players()[i].roundScore());
    }
    return arr;
}

function GetWinner(players) {
    var index = 1;
    var winner = players()[0];
    
    while (index < players().length) {
        if (players()[index].score() < winner.score()) {
            winner = players()[index];
        }
        index++;
    }
    return winner.name;
}

function GameViewModel() {
    var self = this;
    var count = 0;
    var rounds = ["One 3", "Two 3's", "One 4", "Two 4's", "One 5", "Two 5's"];
    
    self.players = ko.observableArray([
        new Player("Player1", 0),
        new Player("Player2", 0)
    ]);

    self.addPlayer = function () {
        self.players.push(new Player("", 0));
    };

    self.removePlayer = function (player) {
        self.players.remove(player);
    };

    self.previousRounds = ko.observableArray([]);

    self.currentRound = ko.observable(rounds[0]);

    self.roundTitle = ko.observable("Run or Collection");

    self.nextRound = function () {
        self.previousRounds.push(new Game(rounds[count], GetScoresForRound(self.players, count)));
        for (var player in self.players()) {
            self.players()[player].roundScore(0);
        }
        
        count++;
        if (count < rounds.length) {
            if (count % 2 === 0) {
                self.roundTitle("Run or Collection");
            }
            else {
                self.roundTitle("Run and Collection");
            }
            self.currentRound(rounds[count]);
            $("#playing-cards").hide();
            showCards(count);
        }
        else if (count === rounds.length) { //last round so get winner
            alert(GetWinner(self.players) + " wins!");
            //alert(self.previousRounds());
            DisplayRoundScores(self.previousRounds());
        }
        else { //reset everything
            count = 0;
            self.roundTitle("Run or Collection");
            self.currentRound(rounds[count]);
            for (var i in self.players()) {
                var p = self.players()[i].score();
                self.players()[i].score(0);
                self.players()[i].roundScore(0);
            }
            self.previousRounds.removeAll();
            $("#previous-rounds").slideUp(400, function () {
                $("#header-scores-container").slideDown(400, function () { });
                $("#results-table").children().remove();
            });
            
            showCards(count);
        }
        
    };
}

function GetCollectionAndRun(roundNumber) {
    if (roundNumber === 0 || roundNumber === 1) { //one 3 / two 3's
        return ["3ofclubs", "3ofdiamonds", "3ofhearts", "7ofClubs", "8ofClubs", "9ofclubs"];
    }
    else if (roundNumber === 2 || roundNumber === 3) { //one 4 / two 4's
        return ["4ofclubs", "4ofdiamonds", "4ofhearts", "4ofspades", "7ofClubs", "8ofClubs", "9ofclubs", "10ofclubs"];
    }
    else if (roundNumber === 4 || roundNumber === 5) { //one 5 / two 5's
        return ["5ofclubs", "5ofdiamonds", "5ofhearts", "5ofspades", "joker", "7ofClubs", "8ofClubs", "9ofclubs", "10ofclubs", "jackofclubs"];
    }
}

function showCards(roundNumber) {
    var count = 0;
    var imgIDs = [];
    var delay = 0;
    $("#playing-cards").show();
    $("img").each(function () {
        if ((this.id.indexOf("of") > -1) || (this.id.indexOf("joker") > -1)) {
            imgIDs.push(this.id);
            $(this).hide();
        }
    });
    var cardsToDisplay = GetCollectionAndRun(roundNumber);
    
    for (var i in cardsToDisplay) {
        $("#" + cardsToDisplay[i]).delay(delay).fadeIn("slow");
        delay += 200;
    }
    
}

$(document).ready(function () {
    ko.applyBindings(new GameViewModel());
    showCards(0);
});