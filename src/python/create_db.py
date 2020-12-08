from mongoengine import *
import json
import sys
import random
import datetime
from PIL import Image
from io import BytesIO
import base64
import os
from os import path
from python_settings import settings
from random_object_id import generate


if sys.argv[1] == "dev":
    os.environ["SETTINGS_MODULE"] = 'settings'
else:
    os.environ["SETTINGS_MODULE"] = 'settings_test'

sys.path.append(settings.SECRET_KEY)

class Struct:
    def __init__(self, **entries):
        self.__dict__.update(entries)


def im_2_b64(image):
    buff = BytesIO()
    image.save(buff, format="PNG")
    img_str = base64.b64encode(buff.getvalue())
    return img_str


db = connect(settings.MONGO_DATABASE_NAME)



basepath = path.dirname(__file__)
filepath = path.abspath(path.join(basepath, "..", "..", "config/admin.json"))
with open(filepath) as f:
    adminData = json.load(f)



def column(matrix, i):
    return [row[i] for row in matrix]


class Users(DynamicDocument):
    _id = ObjectIdField(primary_key=True)
    city = StringField()
    country = StringField()
    name = StringField()
    email = StringField(unique=True, required=True)
    password = StringField()
    administrator = BooleanField()
    date_of_birth = DateField()
    favourite_galleries = ListField()
    recommended_galleries = ListField()
    tokens = ListField()
    avatar = BinaryField()
    createdAt = DateField()
    updatedAt = DateField()

    def json(self):
        user_dict = {
            "_id": str(self.pk),
            "city": self.city,
            "country": self.country,
            "name": self.name,
            "email": self.email,
            "administrator": self.administrator,
            "password": self.email,
            "date_of_birth": self.date_of_birth,
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


def clearDatabaseAndCreateAdmin():
    basepath = path.dirname(__file__)
    filepath = path.abspath(path.join(basepath, "..", "..", "config/admin.json"))
    with open(filepath) as f:
        d = json.load(f)
    #db.drop_database(settings.MONGO_DATABASE_NAME

    for i, x in enumerate(userList):
        if x.email != d.get('email'):
            lunch = x
            lunch.delete()

    for i, x in enumerate(galleriesList):
        if x.owner != d.get('_id'):
            lunch = x
            lunch.delete()





# tworzenie bazy urzytkonwnikow
def createUserAndGalleriesDatabase(n):
    doesAdminExist = 0
    if len(userList)>0:
        for x in userList:
            if  x.email == adminData.get('email'):
                doesAdminExist=1

    if doesAdminExist == 0:
        user1 = Users(
            _id=adminData.get('_id'),
            administrator=True,
            name=adminData.get('name'),
            email=adminData.get('email'),
            password=adminData.get('password'),
        ).save()


    for x in range(n):
        rnd = random.randint(0,3)
        img_path='g'
        if rnd==0:
            img_path='b'
        elif rnd==1:
            img_path='r'

        path1 = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '../..', 'public//img//user_'+img_path+'.png'))
        img =  Image.open(path1)
        img_b64 = im_2_b64(img)

        tempId = generate()
        user1 = Users(
            _id=tempId,
            city="Krakow",
            country="Russia",
            administrator=False,
            date_of_birth=datetime.datetime(2020, 2, 2, 6, 35, 6, 764),
            name="user00" + str(x),
            email="user00" + str(x) + "@gmail.com",
            password="$2a$08$Md0BP6ApyYmZd/SLdIgb6eBmOTOAE1XQZZ4iNP6To8EqmTuoE4aFe",
            avatar=base64.decodebytes(img_b64),
            createdAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764),
            updatedAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764)
        ).save()

    userList_local = Users.objects()

    for x in range(n):
        tempId = generate()
        gal1 = Galleries(
            _id=tempId,
            owner=userList_local[x+1]._id,
            createdAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764),
            updatedAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764)
        ).save()
    galleriesList_local = Galleries.objects()
    return [userList_local, galleriesList_local]



def createLinksBetweenUsers(userList_local):

    for x in range(len(userList_local)):
        randList = random.sample(range(len(userList_local)), 5)
        randPoints =  random.sample(range(10), 5)
        for i in range(len(randList)):
            if userList_local[x].email != userList_local[randList[i]].email and userList_local[x].email != adminData.get('email')  and userList_local[randList[i]].email != adminData.get('email'):
                print(x)
                userTemp = userList_local[x]
                gal = Galleries.objects(owner=userList_local[randList[i]]._id).get()
                userTemp.favourite_galleries.append({"points": randPoints[i], "gallery": gal._id})
                userTemp.save()



def Recursion(john, callibrationBool):
    listToShowToJohn = []
    listToShowToJohnTemp = []

    def geLikedPoints(favourite_galleriesOfUser, i, callibrationBool2):
        if (i < 1):
            return 1
        else:
            counter = 0
            for galleriesC in favourite_galleriesOfUser:
                s = Struct(**galleriesC)
                gal = Galleries.objects(_id=s.gallery).first()
                galOwner = Users.objects(_id=gal.owner).first()
                if callibrationBool2 == 1:
                    pointCalc = s.points * calibrationForGivenUsers(john, galOwner) * i
                else:
                    pointCalc = s.points

                if gal not in listToShowToJohnTemp:
                    listToShowToJohn.append([s.gallery, pointCalc])
                    listToShowToJohnTemp.append(s.gallery)
                else:
                    for n, j in enumerate(listToShowToJohn):
                        if j[0] == gal:
                            listToShowToJohn[n] = [s.gallery, j[1] + pointCalc]

                likedGalleriesOfUserFriends = galOwner.favourite_galleries
                geLikedPoints(likedGalleriesOfUserFriends, i - 1, callibrationBool2)
                counter = counter + 1

    geLikedPoints(john.favourite_galleries, 3, callibrationBool)

    listToShowToJohn.sort(key=lambda x: x[1], reverse=True)

    top20 = listToShowToJohn[:20]

    i = 1
    while len(top20) < 20:
        top20.append([galleriesList[i]._id, 0])
        i += 1

    return top20


def createRecommendedForAllUsers(john):
    userTemp2 = john
    tp = Recursion(userTemp2, 0)

    listToShowToJohnWithGalleries = []
    userTemp2.recommended_galleries = listToShowToJohnWithGalleries

    tabOb = column(tp, 0)
    tabVal = column(tp, 1)

    for i, element in enumerate(tp):
        userTemp2.recommended_galleries.append({"points": tabVal[i], "gallery": tabOb[i]})
        Users.objects(_id=userList[x]._id).update(set__recommended_galleries=userTemp2.recommended_galleries)




def calibrationForGivenUsers(john, johnFriend):
    wagaTemp = 0.1
    for user2 in johnFriend.favourite_galleries:
        for user3 in john.favourite_galleries:
            s1 = Struct(**user2)
            s2 = Struct(**user3)
            if s1 == s2:
                waga = waga + 0.1
    return wagaTemp


def createFinalList(john):
    tp = Recursion(john, 1)
    john.recommended_galleries = []
    for i, element in enumerate(tp):

        john.recommended_galleries.append({"points": column(tp, 1)[i], "gallery": column(tp, 0)[i]})
        Users.objects(_id=john._id).update(set__recommended_galleries=john.recommended_galleries)



userList = Users.objects()
galleriesList = Galleries.objects()



if sys.argv[2] == "clear_db":
	print('elko')
	clearDatabaseAndCreateAdmin()
elif sys.argv[2] == "fill_db":
    createUserAndGalleriesDatabase(int(sys.argv[3]))
    userList = Users.objects()
    galleriesList = Galleries.objects()
    createLinksBetweenUsers(userList)
    for x in range(len(userList)):
        createRecommendedForAllUsers(userList[x])
        
'''elif sys.argv[2] == "recommended initialisation":
    for x in range(len(userList)):
        createRecommendedForAllUsers(userList[x])
elif sys.argv[2] == "recommended final":
    print('elko')
    #for x in range(len(userList)):
    #    createFinalList(userList[x])'''





