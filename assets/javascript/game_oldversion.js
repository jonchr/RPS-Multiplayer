
/////////////
//Variables//
/////////////
  
  var playerNum = "Player1";
  var opponentNum = "Player2";
  var playerWaiting = false;
  var playerChoice;

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCtkPiNqV8GF_WYl0H0KRV_WLvgykGcYuM",
    authDomain: "multiplayerrps-a30a1.firebaseapp.com",
    databaseURL: "https://multiplayerrps-a30a1.firebaseio.com",
    projectId: "multiplayerrps-a30a1",
    storageBucket: "",
    messagingSenderId: "175382932551"
  };
  firebase.initializeApp(config);

  var database = firebase.database();

//////////////
//  Events  //
//////////////

  //When begin button is clicked, submits the player's name into firebase
  $("#begin").on("click", function() {
    
    event.preventDefault();

    //stores the player's name in a temporary player object
    var player = {
    name: $("#name").val().trim(),
    avatar: $("#avatar").val(),
    wins: 0,
    losses: 0,
    ties: 0,
    choice: "",
    waiting: false,
    }; 

    //Pushes the player to the Firebase database
    //If player 1 exists in Firebase, sets up current player as player 2
    //Else, sets up current player as player 1
    database.ref().child("Player1").once("value", function(snapshot) {
      //if player 1 exists
      var userData = snapshot.val();
      if(userData) {
        //player 1 exists
        console.log("You are player 2");
        playerNum = "Player2";
        opponentNum = "Player1";
      }
      else {
        //player 1 doesn't exist
        console.log("You are player 1");
        playerNum = "Player1";
        opponentNum = "Player2";
      }
      database.ref().child(playerNum).set(player);
    });

    //Clears player name from input form
    $("#name").val("");

    //Updates status message to direct player
    updateStatus("Select a option:");
    //Hides player entry form
    toggleShow($("#playerEntry"));
    //Reveals RPS buttons
    toggleShow($("#choiceIcons"));

  });

//Updates the player's box as necessary
  database.ref().child(playerNum).on("value", function(snapshot) {
    if(snapshot!==null) {
      $("#myName").text(snapshot.val().name);
      
      //If the player's avatar exists, displays it
      database.ref().child(playerNum).child("avatar").once("value", function(snapshot){
        if(snapshot.val()) {
          $("#myAvatar").attr("src", "./assets/images/" + snapshot.val() + ".png");
          $("#myAvatar").attr("data-toggle", "on");
          $("#myAvatar").css("display", "initial");
        }
      });      

      $("#myRecord").html("   Wins: " + snapshot.val().wins 
        + "<br/>Losses: " + snapshot.val().losses 
        + "<br/>Ties: " + snapshot.val().ties);
    }
    // If any errors are experienced, log them to console.
  }, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

  //Updates the opponent's box as necessary
  database.ref().child(opponentNum).on("value", function(snapshot) {
    if(snapshot!==null) {
      $("#oppName").text(snapshot.val().name);

      //If the opponent's avatar exists, displays it
      database.ref().child(opponentNum).child("avatar").once("value", function(snapshot){
        if(snapshot.val()) {      
          $("#oppAvatar").attr("src", "./assets/images/" + snapshot.val() + ".png");
          $("#oppAvatar").attr("data-toggle", "on");
          $("#oppAvatar").css("display", "initial");
        }
      });

      $("#oppRecord").html("Wins: " + snapshot.val().wins 
        + "<br/>Losses: " + snapshot.val().losses 
        + "<br/>Ties: " + snapshot.val().ties);
    }
    // If any errors are experienced, log them to console.
  }, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  });


  //When one of the RPS button images is pressed
  $(".myChoice").on("click", function() {

    //Stores the player's choice
    playerChoice = $(this).attr("alt")
    database.ref().child(playerNum).child("choice").set(playerChoice);
    
    //Updates status message
    updateStatus("Waiting on your opponent; in the meantime, feel free to trash talk them below.");

    //Sets the player to waiting mode
    database.ref().child(playerNum).child("waiting").set(true);
    playerWaiting = true;

    toggleShow($("#choiceIcons"));

  });

  //Another check, to respond when both players are waiting
  database.ref().child(opponentNum).on("value", function(snapshot) {
    if(snapshot.val()!==null){
      console.log("checking");
      if (snapshot.val().waiting === true & playerWaiting) {
        console.log("we have a battle!");
        console.log("I chose",playerChoice,"and they chose",snapshot.val().choice);
        compare(playerChoice, snapshot.val().choice);
      }
    }
  // If any errors are experienced, log them to console.
  }, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

  //Saves the message to FireBase when a new message is submitted in the chat box
  $("#submit").on("click", function() {

    event.preventDefault();

    var name  = "";
    database.ref().child(playerNum).once("value", function(snapshot) {
      name = snapshot.val().name;
    });
    database.ref().child("Chat").push(name + ": " + $("#myMessage").val().trim());
    $("#myMessage").val("");
  });

  //Clears the chat in Firebase when the clear button is pressed
  $("#clear").on("click", function() {

    event.preventDefault();
    database.ref().child("Chat").set("");
    $("#chatbox").empty();

  });

  //Updates the chat box anytime something is added
  database.ref().child("Chat").on("child_added", function(childSnapshot, prevChildKey) {
  
    console.log(childSnapshot.val());
    $("#chatbox").prepend("<div>" + childSnapshot.val() + "</div>");

  });

/////////////////
//  Functions  //
/////////////////

  function updateStatus(message) {
    $("#status").text(message);
  }

  //If the passed HTMLObject is hidden, shows it
  //If the passed HTML is visible, hides it
  function toggleShow(myHTMLObject) {

    if(myHTMLObject.attr("data-toggle") === "on") {
      myHTMLObject.attr("data-toggle", "off");
      myHTMLObject.css("display", "none");
    }
    else {
      myHTMLObject.attr("data-toggle", "on");
      myHTMLObject.css("display", "initial");
    }
  }

  //function comparing player's choice to opponent's
  function compare(myChoice, theirChoice) {

    //Sets all of the waiting conditions to false so there's no endless loop
    waiting = false;
    database.ref().child(playerNum).update({
      waiting: false,
      choice: ""
    });
    database.ref().child(opponentNum).update({
      waiting: false,
      choice: ""
    });

    //If tie
    if(myChoice === theirChoice) {
      tie();
    }
    //If you chose rock
    else if(myChoice === "rock") {
      //You lose if they chose paper
      if(theirChoice === "paper") {
        lose();
      }
      //or win if they chose scissors
      else if (theirChoice === "scissors") {
        win();
      }
      //message for if somehow they pick something else (future rock-paper-scissors-lizard-spock?)
      else {
        console.log("Your opponent cheated");
      }
    }
    //If you chose paper
    else if (myChoice === "paper") {
      //You lose if they chose scissors
      if(theirChoice === "scissors") {
        lose();
      }
      //or win if they chose rock
      else if(theirChoice === "rock") {
        win();
      }
      //message for if somehow they pick something else (future rock-paper-scissors-lizard-spock?)
      else {
        console.log("Your opponent cheated");
      }
    }
    //If you chose scissors
    else if (myChoice === "scissors") {
      //You lose if they chose rock
      if(theirChoice === "rock") {
        lose();
      }
      //or win if they chose paper
      else if(theirChoice === "paper") {
        win();
      }
      //message for if somehow they pick something else (future rock-paper-scissors-lizard-spock?)
      else {
        console.log("Your opponent cheated");
      }
    }
    //message for if somehow you pick something else (future rock-paper-scissors-lizard-spock?)
    else {
      console.log("Error: non-standard weapon selection");
    }
  }

  function win() {

    //increase your wins by 1
    database.ref().child(playerNum).once("value", function(snapshot) {
      updatePlayerScore("wins", playerNum, snapshot.val().wins + 1);
    });
    //increases their losses by 1
    //since wins is only called by the active player, hopefully won't have an issue of double results
    database.ref().child(opponentNum).once("value", function(snapshot) {
      updatePlayerScore("losses", opponentNum, snapshot.val().losses + 1);
    });

    updateStatus("You won! If you want to play again, select one from below!");
    toggleShow($("#choiceIcons"));
    //appropriate messaging
    //reset game
  }

  function lose() {
     //increase your losses by 1
    database.ref().child(playerNum).once("value", function(snapshot) {
      updatePlayerScore("losses", playerNum, snapshot.val().losses + 1);
    });
    //increase their wins by 1
    database.ref().child(opponentNum).once("value", function(snapshot) {
      updatePlayerScore("wins", opponentNum, snapshot.val().wins + 1);
    });
    
    updateStatus("You lost! If you want to get another chance, select one of the below.");

    //reset game
  }

  function tie() {
    //Increases your and their ties by 1
    database.ref().child(playerNum).once("value", function(snapshot) {
      updatePlayerScore("ties", playerNum, snapshot.val().ties + 1);
    });
    database.ref().child(opponentNum).once("value", function(snapshot) {
      updatePlayerScore("ties", opponentNum, snapshot.val().ties + 1);
    });
    //appropriate messaging
    //reset game
  }

  //New function needed because of asynchronity
  function updatePlayerScore(outcome, player, score) {
    database.ref().child(player).child(outcome).set(score);
  }

///////////////////
//  Active Text  //
///////////////////

  updateStatus("Set up your profile to start!");
