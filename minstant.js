

if (Meteor.isClient) {

  //subscribe to the Collection
  Meteor.subscribe("chats");
  Meteor.subscribe("users");
  Meteor.subscribe("emojis");

  // set up the main template the the router will use to build pages
  Router.configure({
    layoutTemplate: 'ApplicationLayout'
  });
  // specify the top level route, the page users see when they arrive at the site
  Router.route('/', function () {
    console.log("rendering root /");
    this.render("navbar", {to:"header"});
    this.render("lobby_page", {to:"main"});
  });

  // specify a route that allows the current user to chat to another users
  Router.route('/chat/:_id', function () {
    // the user they want to chat to has id equal to
    // the id sent in after /chat/...
    var otherUserId = this.params._id;
    // find a chat that has two users that match current user id
    // and the requested user id

    //A filter to check if the retrieved chat Id belongs to the logged in User
    var chatId = Meteor.apply('addChat', [otherUserId], { returnStubValue: true });

    var userPrivacyFilter;

    if (chatId){
      Session.set("chatId", chatId);
    }
    this.render("navbar", {to:"header"});
    this.render("chat_page", {to:"main"});
  });

  ///
  // helper functions
  ///
  Template.available_user_list.helpers({
    users:function(){
      return Meteor.users.find();
    }
  })
 Template.available_user.helpers({
    getUsername:function(userId){
      user = Meteor.users.findOne({_id:userId});
      return user.profile.username;
    },
    isMyUser:function(userId){
      if (userId == Meteor.userId()){
        return true;
      }
      else {
        return false;
      }
    }
  })


  Template.chat_page.helpers({
    messages:function(){
      var chat = Chats.findOne({_id:Session.get("chatId")});
      return chat.messages;
    },
    other_user:function(userId){
      console.log("chat_page helper other_user called")
      var chat = Chats.findOne({_id:Session.get("chatId")});
      if(chat.user1Id == Meteor.userId()){
        otherUserId = chat.user2Id;
      } else {
        otherUserId = chat.user1Id;
      }

      var user = Meteor.users.findOne({_id:otherUserId});
      return user.profile.username;
    },
    settings: function() {
      return {
        position: "top",
        limit: 5,
        rules: [
          {
            token: '@',
            collection: Meteor.users,
            field: "username",
            template: Template.userPill
          },
          {
            token: '!',
            collection: Dataset,
            field: "_id",
            options: '',
            matchAll: true,
            filter: { type: "autocomplete" },
            template: Template.dataPiece
          }
        ]
      };
    }
  });

  Template.chat_message.helpers({
    userName: function(userId){
      var user = Meteor.users.findOne({_id:userId});
      return user.profile.username;
    },
    getAvatar: function(userId){
      var user = Meteor.users.findOne({_id:userId});
      return user.profile.avatar;
    }
  })

 Template.chat_page.events({
  // this event fires when the user sends a message on the chat page
  'submit .js-send-chat':function(event){
    // stop the form from triggering a page reload
    event.preventDefault();
    // see if we can find a chat object in the database
    // to which we'll add the message

      // is a good idea to insert data straight from the form
      // (i.e. the user) into the database?? certainly not.
      // push adds the message to the end of the array
    Meteor.call("addMessage", event.target.chat.value, Session.get("chatId"));
      // reset the form
    event.target.chat.value = "";
      // put the messages array onto the chat object

      // update the chat object in the database.
  }
 })
}


// start up script that creates some users for testing
// users have the username 'user1@test.com' .. 'user8@test.com'
// and the password test123

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (!Meteor.users.findOne()){
      for (var i=1;i<9;i++){
        var email = "user"+i+"@test.com";
        var username = "user"+i;
        var avatar = "ava"+i+".png"
        console.log("creating a user with password 'test123' and username/ email: "+email);
        Meteor.users.insert({profile:{username:username, avatar:avatar}, emails:[{address:email}],services:{ password:{"bcrypt" : "$2a$10$I3erQ084OiyILTv8ybtQ4ON6wusgPbMZ6.P33zzSDei.BbDL.Q4EO"}}});
      }
    }
  });

  Meteor.publish("chats", function(){
    return Chats.find({
      $or:[
        {user1Id:this.userId},
        {user2Id:this.userId}
      ]
    });
  });
  Meteor.publish("users", function(){
    return Meteor.users.find({});
  });
  Meteor.publish('emojis', function() {
  // Here you can choose to publish a subset of all emojis
  // if you'd like to.
  return Emojis.find();
});
}
