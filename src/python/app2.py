from mongoengine import *
import json
import random

connect("mongo-dev-db")

class User (Document):
    username = StringField(unique=True, required=True)
    age = IntField()

    def json(self):
        user_dict = {
            "username": self.username,
            "age": self.age
        }
        return json.dumps(user_dict)

    meta = {
        "indexes": ["username"]
    }


class Likes(DynamicDocument):
    author = ReferenceField(User)
    recivingUser = ReferenceField(User)
    valueInt = IntField

    def json(self):
        likes_dict = {
            "author": self.author,
            "recivingUser": self.recivingUser,
            "valueInt": self.valueInt
        }
        return json.dumps(likes_dict)

#tworzenie bazy urzytkonwnikow
'''for x in range(100):
    user1 = User(
        username="user "+str(x),
        age=25+x%5
    ).save()'''

userList = User.objects()

#tworzenie połączen pomiędzy urzytkownikami
'''for x in range(100):
    for y in range(100):
        if userList[x].username != userList[y].username:
            a = random.randint(0, 5)
            if a == 0:
                print("ccc")
                ll1 = Likes(author=userList[x], recivingUser=userList[y],valueInt=random.randint(1, 5)).save()'''

john = userList[0]
listToShowToJohn = []

LikesOfJohn = Likes.objects(author=john)
listToShowToJohn = []


def geLikedPoints(LikesOfUser, i):
    if(i < 1):
        return 1
    else:
        for like in LikesOfUser:
           # print( like.recivingUser.username)
            if like.recivingUser not in listToShowToJohn:
                listToShowToJohn.append(like.recivingUser)

            LikesOfUserFriends = Likes.objects(author=like.recivingUser)
            geLikedPoints(LikesOfUserFriends, i-1)


geLikedPoints(LikesOfJohn, 3)






#tworzenie listy dla Johna




''''for like in LikesOfJohn:
   likesOfJohnFriends=Likes.objects(author=like.recivingUser)
   for likeOfFriend in likesOfJohnFriends:
       if likeOfFriend.recivingUser not in listToShowToJohn:
           listToShowToJohn.append(likeOfFriend.recivingUser)'''''



#wyeliminowanie z listy profilow juz polubionych

for element in listToShowToJohn:
    isItAlreadyLiked = 0
    for elementInJonhsList in LikesOfJohn:
        if element == elementInJonhsList:
            isItAlreadyLiked = 1

    if element == john:
        isItAlreadyLiked = 1

    if isItAlreadyLiked == 0:
        print(element.username)
