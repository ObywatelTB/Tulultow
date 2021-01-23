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
import recommended_functions as recommend
from recommended_functions import Users
from recommended_functions import Galleries
from recommended_functions import Reactions
from recommended_functions import Exhibits

class Struct:
    def __init__(self, **entries):
        self.__dict__.update(entries)

def im_2_b64(image):
    buff = BytesIO()
    image.save(buff, format="PNG")
    img_str = base64.b64encode(buff.getvalue())
    return img_str

def column(matrix, i):
    return [row[i] for row in matrix]



def clear_database_except_admin():
    basepath = path.dirname(__file__)
    filepath = path.abspath(path.join(basepath, "..", "..", "config/admin.json"))
    with open(filepath) as f:
        admin_json = json.load(f)

    for usr in userList:
        if usr.email != admin_json.get('email'):
            usr.delete()

    for glr in galleriesList:
        if glr.owner != admin_json.get('_id'):
            glr.delete()

    for rct in reactionList:
            rct.delete()

    for exh in exhibitList:
            exh.delete()
    
   
    tempId = generate()
    Galleries(
        _id=tempId,
        owner=adminData.get('_id'),
        createdAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764),
        updatedAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764)
    ).save()
        
def create_users_and_galleries(number_of_users):
    does_admin_exist = 0
    if len(userList)>0:
        for usr in userList:
            if  usr.email == adminData.get('email'):
                does_admin_exist=1

    if does_admin_exist == 0:
        Users(
            _id=adminData.get('_id'),
            administrator=True,
            name=adminData.get('name'),
            email=adminData.get('email'),
            password=adminData.get('password'),
        ).save()

        tempId = generate()
        Galleries(
            _id=tempId,
            owner=adminData.get('_id'),
            createdAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764),
            updatedAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764)
        ).save()

    for usr in range(number_of_users):
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
        Users(
            _id=tempId,
            city="Krakow",
            country="Russia",
            administrator=False,
            date_of_birth=datetime.datetime(2020, 2, 2, 6, 35, 6, 764),
            name="user00" + str(usr),
            email="user00" + str(usr) + "@gmail.com",
            password="$2a$08$Md0BP6ApyYmZd/SLdIgb6eBmOTOAE1XQZZ4iNP6To8EqmTuoE4aFe",
            avatar=base64.decodebytes(img_b64),
            createdAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764),
            updatedAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764)
        ).save()

    userList_local = Users.objects()

    for usr in range(number_of_users):
        tempId = generate()
        Galleries(
            _id=tempId,
            owner=userList_local[usr+1]._id,
            createdAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764),
            updatedAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764)
        ).save()
    galleriesList_local = Galleries.objects()
    return [userList_local, galleriesList_local]

def create_links_between_users(userList_local):
    for j in range(len(userList_local)):
        randList = random.sample(range(len(userList_local)), 5)
        randPoints =  random.sample(range(10), 5)
        for i in range(len(randList)):
            if userList_local[j].email != userList_local[randList[i]].email and userList_local[j].email != adminData.get('email')  and userList_local[randList[i]].email != adminData.get('email'):
                
                userTemp = userList_local[j]
                gal = Galleries.objects(owner=userList_local[randList[i]]._id).get()
                userTemp.favourite_galleries.append({"points": randPoints[i], "gallery": gal._id})
                userTemp.save()

def create_recommended_list(given_user):
    userTemp2 = given_user
    tp = recommend.create_recommended(userTemp2, 0,15,name_of_file)
    list_to_show_to_given_user = []
    userTemp2.recommended_galleries = list_to_show_to_given_user
    tabOb = column(tp, 0)
    tabVal = column(tp, 1)

    for i, element in enumerate(tp):
        userTemp2.recommended_galleries.append({"points": tabVal[i], "gallery": tabOb[i]})
        Users.objects(_id=userList[x]._id).update(set__recommended_galleries=userTemp2.recommended_galleries)


ON_HEROKU = 'ON_HEROKU' in os.environ	
name_of_file='settings'

if ON_HEROKU:
    print('Im in Heroku')
    os.environ["SETTINGS_MODULE"] = 'settings_heroku'
    name_of_file='settings_heroku'
else:
    if sys.argv[1] == "tulultow-api":
        os.environ["SETTINGS_MODULE"] = 'settings'
        sys.path.append(settings.SECRET_KEY)
        name_of_file='settings'
    if sys.argv[1] == "tulultow-api-test":
        os.environ["SETTINGS_MODULE"] = 'settings_test'
        sys.path.append(settings.SECRET_KEY)
        name_of_file='settings_test'

#db = connect(settings.MONGO_DATABASE_NAME)
db = connect(settings.MONGO_DATABASE_NAME, host=settings.MONGODB_URI)


basepath = path.dirname(__file__)
filepath = path.abspath(path.join(basepath, "..", "..", "config/admin.json"))
with open(filepath) as f:
    adminData = json.load(f)



userList = Users.objects()
galleriesList = Galleries.objects()
reactionList = Reactions.objects()
exhibitList = Exhibits.objects()

if sys.argv[2] == "clear_db":
    clear_database_except_admin()
    print('db_cleared')
elif sys.argv[2] == "fill_db":
    create_users_and_galleries(int(sys.argv[3]))
    userList = Users.objects()
    galleriesList = Galleries.objects()
    create_links_between_users(userList)
    for x in range(len(userList)):
        create_recommended_list(userList[x])
    print('db_created')

