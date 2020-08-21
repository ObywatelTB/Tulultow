import math
'''import json
import sys
sys.path.append('C:/Users/Mateusz/Anaconda3/envs/tulultow/Lib/site-packages')
from mongoengine import *'''

print("a")

'''connect("tulultow-api")

def column(matrix, i):
    return [row[i] for row in matrix]

class User (DynamicDocument):
    email = StringField(unique=True, required=True)
    password = StringField()
    administrator = BooleanField()
    name = StringField()
    date_of_birth = DateField()
    city = StringField()
    country = StringField()
    favourite_galleries = ListField()
    recommended_galleries = ListField()
    tokens = ListField()
    createdAt = DateField()
    updatedAt = DateField()

    def json(self):
        user_dict = {
            "city": self.city,
            "country": self.country,
            "name": self.name,
            "date_of_birth": self.date_of_birth,
            "administrator": self.administrator,
            "email": self.email,
            "password": self.password,
            "favourite_galleries": self.favourite_galleries,
            "recommended_galleries": self.recommended_galleries,
            "tokens": self.tokens,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
        return json.dumps(user_dict)

    meta = {
        "indexes": ["email"]
    }

userList = User.objects()

#john = userList[3]
#print(sys.argv[1])

john=User.objects.get(email=sys.argv[1])
print(john.name)

listToShowToJohn = []
listToShowToJohnTemp = []


tempTabWithIndexes = []
tempTabWithPoints = []

def geLikedPoints(favourite_galleriesOfUser, i):
    if(i < 1):
        return 1
    else:
        counter = 0
        for galleries in favourite_galleriesOfUser:
            tempTabWithIndexes.append(galleries[0].name[5:])
            if galleries[0] not in listToShowToJohnTemp:
                listToShowToJohn.append([galleries[0], galleries[1]])
                listToShowToJohnTemp.append(galleries[0])
            else:
                for n, j in enumerate(listToShowToJohn):
                    if j[0] == galleries[0]:
                        listToShowToJohn[n] = [galleries[0], j[1]+galleries[1]]

            likedGalleriesOfUserFriends = galleries[0].favourite_galleries
            geLikedPoints(likedGalleriesOfUserFriends, i-1)
            counter = counter+1


geLikedPoints(john.favourite_galleries, 3)


listToShowToJohn.sort(key=lambda x:x[1],reverse=True)
top5 = listToShowToJohn[:5]

i=1
while len(top5)<4:
    top5.append([userList[i], 0])
    i += 1

john.recommended_galleries = top5
john.save()



for i in listToShowToJohn:
    print(i[0].name + ' ' + str(i[1]))'''


