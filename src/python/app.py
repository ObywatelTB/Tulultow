from mongoengine import *
import json
import random

connect("tulultow-api-test")

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

#tworzenie bazy uzytkonwnikow
for x in range(100):
    user1 = User(
        username="user "+str(x),
        age=25+x%5
    ).save()

userList = User.objects()

#tworzenie połączen pomiędzy uzytkownikami
for x in range(20):
    for y in range(20):
        if userList[x].username != userList[y].username:
            a = random.randint(0, 5)
            if a == 0:
                print("ccc")
                ll1 = Likes(author=userList[x], recivingUser=userList[y],valueInt=random.randint(1, 5)).save()'''


#tworzenie listy dla Johna
john = userList[0]

LikesOfJohn = Likes.objects(author=john)
listToShowToJohn = []

for like in LikesOfJohn:
   likesOfJohnFriends=Likes.objects(author=like.recivingUser)
   for likeOfFriend in likesOfJohnFriends:
       if likeOfFriend.recivingUser not in listToShowToJohn:
           listToShowToJohn.append(likeOfFriend.recivingUser)



#wyeliminowanie z listy profilow juz polubionych

for element in listToShowToJohn:
    isItAlreadyLiked = 0
    for elementInJonhsList in LikesOfJohn:
        if element == elementInJonhsList:
            isItAlreadyLiked = 1

    if isItAlreadyLiked == 0:
        print(element.username)
'''