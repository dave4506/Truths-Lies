games = new Mongo.Collection("games");
words = new Mongo.Collection("words");
if (Meteor.isClient) {
  Router.route('/', function() {
    this.render('index');
  });
  Router.route('/game', function(){
    var query = this.params.query.id;
    Session.set("gameid",this.params.query.id);
    Session.set("stname", true);
    Session.set("user", "hrey");
    Session.set("gamestate", true);
    console.log("gameid:" + query);
    this.render('game');

  }, {
    name: 'gamebefore'
  });
  Router.route('/dashboard', function(){
    var query = this.params.query.id;
    Session.set("gameid",this.params.query.id);
    Session.set("gamestate", true);
    Session.set("user",this.params.query.player);
    Session.set("round",1);
    Session.set("theword","");
    Session.set("prompt","")
    Session.set("prompts","")
    Session.set("nextV",false);
    Session.set("qindex",0)
    Session.set("next",false)
    Session.set("nextr",false)
    Session.set("answer",false);
    Session.set("response", "_____");
    console.log("gameid:" + this.params.query.player);
    this.render('dashboard');

  }, {
    name: 'dash'
  });

  Router.route('/karan', function(){
    this.render('admin');

  }, {
    name: 'admin'
  });

  Template.game.helpers({
    ids: function() {
      return Session.get("gameid");
    },
    stname: function() {
      if(Session.get("stname")){
        return true;
      }else{
        return false;
      }
    }
  });
  Template.roster.helpers({
    players: function(){
      var id = Session.get("gameid");
      console.log("roster" + id);
      console.log(games.findOne({gameid:id}).players);
      return games.findOne({gameid:id}).players;
    }
  });
  Template.gamebuttons.events({
    'submit form': function(event){
      event.preventDefault();
      var gamesid = event.target.findGame.value;
      console.log("Form submitted")
      console.log(gamesid);
      Router.go("gamebefore", {_id: 1},{query: 'id=' + gamesid });
    },

    'click #creates': function(event){
      event.preventDefault();
      var id = makeid();
      games.insert({gameid: id, players: [],round: 1 ,questions:[]});
      Router.go("gamebefore", {_id: 1},{query: 'id=' + id });
      console.log("create submitted");
      console.log(games.findOne({gameid: id}).gameid);
    }
  });

  Template.createname.events({
    'submit form': function(event){
      event.preventDefault();
      var playerNameVar = event.target.playerName.value;
      var name= Session.get("gameid");
      var playerslist = games.findOne({gameid:name}).players;
      var gamesid=games.findOne({gameid:name})._id;
      var objects= { player : playerNameVar, score: 0 };
      playerslist[playerslist.length] = objects;
      Session.set("user",playerNameVar);

      console.log(playerslist);
      games.update({_id: gamesid},{gameid: name, players: playerslist, round: 1,questions:games.findOne({gameid:name}).questions});
      console.log(games.findOne(gamesid).players);
      Session.set("stname",false);
    }

  });
  Template.voting.helpers({
    quest: function(){
      var name = Session.get("gameid");
      var str = games.findOne({gameid:name}).questions
      console.log(str);
      var i = 0;
      var re ="default";
      do{
        var status = str[i].answered;
        console.log(status);
        if(status == false){
          re= str[i].question
          Session.set('qindex',i);
          i = str.length;
        }
        else{
          i++;
        }
        console.log("i" + i + "str" + str.length);
      }while(i<str.length)
      var s = Session.get("response")
      re = re.replace("**",s);
      return re;
    },
    as: function(){
      var name = Session.get("gameid");
      var obj = games.findOne({gameid:name})
      var id = games.findOne({gameid:name})._id;
      var quest = obj.questions;
      var qq = quest[Session.get("qindex")];
      var an = qq.ans;
      return an;
    },

     prom: function(){
       var name = Session.get("gameid");
       var obj = games.findOne({gameid:name})
       var id = games.findOne({gameid:name})._id;
       var quest = obj.questions;
       var qq = quest[Session.get("qindex")];
       var an = qq.ans;
       var counter = 0;
       for(var i = 0;i<an.length;i++){
         console.log("values"+an[i].votes);
         counter += an[i].votes;
       }
       console.log(counter + " df");
       if(counter>=obj.players.length){
         Session.set("nextr",true);
         return "Aight! Let's see the results"
       }
       return Session.get("prompt");
     }

  })
  Template.voting.events({
    'submit #gg': function(event){
      event.preventDefault();
      var playerNameVar = event.target.s.value;
      var name = Session.get("gameid");
      var obj = games.findOne({gameid:name})
      var id = games.findOne({gameid:name})._id;
      var quest = obj.questions;
      var qq = quest[Session.get("qindex")];
      var an = qq.ans;
      Session.set("prompts","Can't find that! Try something else!")
      for(var i = 0;i<an.length;i++){
        if(playerNameVar == an[i].the){
          var old = an[i].votes
          old++;
          console.log("old" + old)
          var ob = {
            the: an[i].the,
            votes: old,
            user: an[i].user
          }
          quest[Session.get(i)]=ob;
          games.update({_id: id},{gameid:name,players:obj.players,round:obj.round,questions:quest})
          Session.set("prompts","Great! Wait for others to vote!")
        }
      }
    }


  });
  Template.answr.helpers({
      quest: function(){
        var name = Session.get("gameid");
        var str = games.findOne({gameid:name}).questions
        console.log(str);
        var i = 0;
        var re ="default";
        do{
          var status = str[i].answered;
          console.log(status);
          if(status == false){
            re= str[i].question
            Session.set('qindex',i);
            i = str.length;
          }
          else{
            i++;
          }
          console.log("i" + i + "str" + str.length);
        }while(i<str.length)
        var s = Session.get("response")
        re = re.replace("**",s);
        return re;
      },
      prom: function(){
        var name = Session.get("gameid");
        var obj = games.findOne({gameid:name})
        var id = games.findOne({gameid:name})._id;
        var quest = obj.questions;
        var qq = quest[Session.get("qindex")];
        var an = qq.ans
        console.log(an);
        Session.set("nextV",true);
        if(an.length>=obj.players.length){
          Session.set("nextV",true);
          return "Awesome! hit next to go on!"
        }else{
          return "Just chill. Wait for the others!"
        }
      },
      next: function(){
        console.log(Session.get("nextV"))
        return Session.get("nextV");
      }
  });

  Template.answr.events({
    'submit #g': function(event){
      event.preventDefault();
      var wordvar = event.target.ans.value;
      var name = Session.get("gameid");
      var obj = games.findOne({gameid:name})
      var id = games.findOne({gameid:name})._id;
      var quest = obj.questions;
      console.log(Session.get("qindex"))
      var qq = quest[Session.get("qindex")];
      console.log(qq);
      var an = qq.ans
      an[an.length] = {
        the: wordvar,
        votes: 0,
        user: Session.get("user")
        }
      var q = {
        question : qq.question,
        answered : qq.answered,
        ans:an
      }
      console.log(q);
      quest[Session.get("qindex")]=q;

      games.update({_id: id},{gameid:name,players:obj.players,round:obj.round,questions:quest})

    }

  });

  Template.roster.events({
    'click #plays': function(event){
      event.preventDefault();
      var id = Session.get("gameid");
      var usr = Session.get("user");
      Router.go("dash", {_id: 1},{query: 'id=' + id + '&player=' + usr });
      console.log("create submitted");
      console.log(games.findOne({gameid: id}).gameid);
    }
  });
  Template.sideroster.helpers({
    user: function(){
      var id = Session.get("user");
      console.log("roster" + id);
      return id;
    },
    players: function(){
      var id = Session.get("gameid");
      console.log("roster" + id);
      console.log(games.findOne({gameid:id}).players);
      return games.findOne({gameid:id}).players;
    },
    ids: function() {
      return Session.get("gameid");
    }
  });
  Template.dashboard.helpers({
    round: function(){
      return Session.get("round");
    },
    card: function(){
      return Session.get("gamestate");
    },
    as: function(){
      var name = Session.get("gameid");
      var obj = games.findOne({gameid:name})
      var id = games.findOne({gameid:name})._id;
      var quest = obj.questions;
      var qq = quest[Session.get("qindex")];
      var an = qq.ans;
      return an;
    }

  });
  Template.preround.helpers({
    words: function(){

      var query = {};
      var n = words.find({}).fetch();
      console.log(n);
      var r = Math.floor(Math.random() * n.length);
      console.log(r);
      var z = n[r];
      Session.set("theword",z.word);
      return z.word;
    },
    prom: function(){
      var is = Session.get("gameid");
      var obj = games.findOne({gameid:is});
      if(obj.players.length==obj.questions.length){
        Session.set("next",true);
        return "hit the next button!"
      }
      return Session.get("prompt");
    },
    next: function(){
      return Session.get("next");
    },
    answer: function(){
      return Session.get("answer");
    }
  });

  Template.preround.events({
    'submit form': function(event){
      event.preventDefault();
      var name = Session.get("gameid");
      console.log("df" + name);
      var wordvar = event.target.sentence.value;
      var ind = wordvar.indexOf(Session.get("theword"));
      if(ind==-1){
        Session.set("prompt","Try Again! You didn't use the word!")
      }else{
        var ins = wordvar.indexOf("**");
        console.log(ins);
        if(ins==-1){
          Session.set("prompt","Try Again! You didn't use the **!")
        }else{
          console.log(name);
          var arr = games.findOne({gameid:name}).questions;
          var ga = {
            question : wordvar,
            answered : false,
            ans:[]
          }
          console.log(arr);
          var obj = games.findOne({gameid:Session.get("gameid")});
          console.log(obj.questions);
          arr[arr.length] = ga;
          var gamesid=games.findOne({gameid:name})._id;
          games.update({_id: gamesid},{gameid:name,players:obj.players,round:obj.round,questions:arr})

          var g = games.findOne({gameid: name});
          var gg = g.questions;
          console.log(gg + " hello");
          if(gg.length!=g.players.length){
            Session.set("prompt","Success! wait for players to finish!");
          }
      }
      console.log(wordvar);
      }
    },
    'click #next': function(event){
      event.preventDefault();
      Session.set("answer",true);
      Session.set("gamestate",false);
    }
  })
  Template.scoreboard.helpers({
    players: function(){
      var id = Session.get("gameid");
      console.log("roster" + id);
      return games.findOne({gameid:id}).players;
    }
  });
  Template.admin.events({
    'submit form': function(event){
      event.preventDefault();
      var wordvar = event.target.word.value;
      words.insert({word:wordvar});
      console.log(words.findOne({word:wordvar}).word)
    }
  });
  Template.admin.helpers({
    words: function(){
      return words.find({});
    }
  });
}

function makeid()
{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
