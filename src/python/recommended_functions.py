import json
import sys
import os
from mongoengine import *
from python_settings import settings


class Struct:
    def __init__(self, **entries):
        self.__dict__.update(entries)

class Users (DynamicDocument):
    _id = ObjectIdField(primary_key=True)
    email = StringField(unique=True, required=True)
    password = StringField()
    administrator = BooleanField()
    name = StringField()
    date_of_birth = DateField()
    city = StringField()
    country = StringField()
    favourite_galleries = ListField()
    recommended_galleries = ListField()
    avatar = BinaryField()
    tokens = ListField()
    createdAt = DateField()
    updatedAt = DateField()

    def json(self):
        user_dict = {
            "_id": self._id,
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
            "avatar": self.avatar,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
        return json.dumps(user_dict)

    meta = {
        "indexes": ["email"]
    }


class Galleries(DynamicDocument):
    _id = ObjectIdField(primary_key=True)
    categories = ListField()
    rooms = ListField()
    owner = ObjectIdField()
    createdAt = DateField()
    updatedAt = DateField()

    def json(self):
        user_dict = {
            "_id": str(self.pk),
            "categories": self.city,
            "rooms": self.country,
            "owner": self.owner,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
        return json.dumps(user_dict)

    meta = {
        "indexes": ["email"]
    }





class Reactions(DynamicDocument):
    _id = ObjectIdField(primary_key=True)
    gallery_id = ObjectIdField()
    likes = ListField(StringField())
    comments = ListField(StringField())
    createdAt = DateField()
    updatedAt = DateField()
   

    def json(self):
        user_dict = {
            "_id": str(self.pk),
            "gallery_id": self.gallery_id,
            "likes": self.likes,
            "comments": self.comments,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt,
           
        }
        return json.dumps(user_dict)

    meta = {
        "indexes": ["email"]
    }


class Exhibits(DynamicDocument):
    _id = ObjectIdField(primary_key=True)
    content = ObjectIdField()
    title = StringField()
    category = StringField()
    owner =  ObjectIdField()
    picture = BinaryField()
    createdAt = DateField()
    updatedAt = DateField()
   

    def json(self):
        user_dict = {
            "_id": str(self.pk),
            "content": self.content,
            "title": self.title,
            "category": self.category,
            "owner": self.title,
            "picture": self.category,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt,
           
        }
        return json.dumps(user_dict)

    meta = {
        "indexes": ["email"]
    }


def geLikedPoints(given_user, favourite_galleriesOfUser, i, callibrationBool2):
    list_to_show_to_user = []
    list_to_show_to_user_Temp = []
    if (i < 1):
        return 1
    else:
        counter = 0
        for galleriesC in favourite_galleriesOfUser:
            s = Struct(**galleriesC)
            gal = Galleries.objects(_id=s.gallery).first()
            galOwner = Users.objects(_id=gal.owner).first()
            if callibrationBool2 == 1:
                pointCalc = s.points * calibrationForGivenUsers(given_user, galOwner) * i
            else:
                pointCalc = s.points

            if gal not in list_to_show_to_user_Temp:
                list_to_show_to_user.append([s.gallery, pointCalc])
                list_to_show_to_user_Temp.append(s.gallery)
            else:
                for n, j in enumerate(list_to_show_to_user):
                    if j[0] == gal:
                        list_to_show_to_user[n] = [s.gallery, j[1] + pointCalc]

            likedGalleriesOfUserFriends = galOwner.favourite_galleries
            geLikedPoints(given_user, likedGalleriesOfUserFriends, i - 1, callibrationBool2)
            counter = counter + 1
    return list_to_show_to_user



def create_recommended(given_user, callibration_bool, size_of_list, name_of_file):
    lunchDB(name_of_file)
    galleriesList = Galleries.objects()
    list_to_show_to_user = geLikedPoints(given_user, given_user.favourite_galleries, 3, callibration_bool)  
    list_to_show_to_user.sort(key=lambda x: x[1], reverse=True)
    top20 = list_to_show_to_user[:20]
    newTop20 =[]
     
    i = 1
    for itt in top20:
        isItAlreadyThere=0
        for t in newTop20:
            if t[0] == itt[0]:
                isItAlreadyThere=1
            
        if isItAlreadyThere==0:
            newTop20.append([itt[0], itt[1]])
        i += 1

    i = 1
    while (len(newTop20) < size_of_list-1) :
        if galleriesList[i].owner != given_user._id:
            isItAlreadyThere=0
            for t in newTop20:
                if t[0] == galleriesList[i]._id:
                    isItAlreadyThere=1
            if isItAlreadyThere==0:        
                newTop20.append([galleriesList[i]._id, 0])
        i += 1

    return newTop20



def lunchDB(strFileName):
    os.environ["SETTINGS_MODULE"] = strFileName
    #connect(settings.MONGO_DATABASE_NAME)
    connect(settings.MONGO_DATABASE_NAME, host=settings.MONGODB_URI)


def calibrationForGivenUsers(givenUser, givenUser_friend):
    wagaTemp=0.1
    for user2 in givenUser_friend.favourite_galleries:
        for user3 in givenUser.favourite_galleries:
            s1 = Struct(**user2)
            s2 = Struct(**user3)
            if s1 == s2:
                waga=waga+0.1

    return wagaTemp