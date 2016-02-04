Meteor.methods({
  addMessage: function(message, chatId){
    console.log("addMessage method called!");
    if(!this.userId){
      return;
    } else {
      var chat = Chats.findOne({_id:chatId});
      if (chat){// ok - we have a chat to use
        var msgs = chat.messages; // pull the messages property
        if (!msgs){// no messages yet, create a new array
          msgs = [];
        }
        Sender = Meteor.userId();
        msgs.push({text:message, sender: Sender});
        chat.messages = msgs;
        Chats.update(chat._id, chat);
      }
    }
  },
  addChat: function(otherUserId){
    if(!this.userId){return;}
    var filter = {$or:[
                {user1Id:Meteor.userId(), user2Id:otherUserId},
                {user2Id:Meteor.userId(), user1Id:otherUserId}
                ]};
    var chat = Chats.findOne(filter);
    if (!chat){// no chat matching the filter - need to insert a new one
      console.log("New chat added!");
      chatId = Chats.insert({user1Id:Meteor.userId(), user2Id:otherUserId});
    }
    else {// there is a chat going already - use that.
      chatId = chat._id;
    }
    return chatId;
  }
});
