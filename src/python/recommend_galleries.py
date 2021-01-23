import json
import sys
import os
from python_settings import settings
from mongoengine import *
import recommended_functions as recommend
from recommended_functions import Users
from recommended_functions import Galleries

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


#connect(settings.MONGO_DATABASE_NAME)
connect(settings.MONGO_DATABASE_NAME, host=settings.MONGODB_URI)



class Struct:
    def __init__(self, **entries):
        self.__dict__.update(entries)


def column(matrix, i):
    return [row[i] for row in matrix]



def create_list_of_recommended(given_user):
    user_temp = given_user

   # tp = recursion(userTemp2, 0, sizeOfList1)
    tp = recommend.create_recommended(user_temp, 0,15,name_of_file)

    list_to_show_to_givenUser_with_galleries = []
    user_temp.recommended_galleries = list_to_show_to_givenUser_with_galleries

    tabOb = column(tp, 0)
    tabVal = column(tp, 1)

    for i, element in enumerate(tp):
        user_temp.recommended_galleries.append({"points": tabVal[i], "gallery": tabOb[i]})
        Users.objects(_id=given_user._id).update(set__recommended_galleries=user_temp.recommended_galleries)





def create_final_list(given_user):
    sizeOfList1=20
    if  len(userList)<20:
        sizeOfList1=len(userList)-1
    #tp = recursion(john, 1, sizeOfList1)
    tp = recommend.create_recommended(given_user, 1,15,name_of_file)
    given_user.recommended_galleries = []
    for i, element in enumerate(tp):
        given_user.recommended_galleries.append({"points": column(tp, 1)[i], "gallery": column(tp, 0)[i]})
        Users.objects(_id=given_user._id).update(set__recommended_galleries=given_user.recommended_galleries)




userList = Users.objects()
galleriesList = Galleries.objects()

user0=Users.objects.get(email=sys.argv[2])
#user0=Users.objects.get(email="Username@gmail.com")



#Inicjalizacja dla wszystkich użytkowników
create_list_of_recommended(user0)

#kalibracja i propozycja
create_final_list(user0)


