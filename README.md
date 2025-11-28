## SOME RULES TO BE FOLLOWED

- now all passwords are required to be of 8 digit only
- student ig and subject id would be int whereas teacher id and admin id would be strings
- any unique id which is int is only allowed to be between 0 and 99999999
- **Limit of subject cant be viewed, edited or deleted for now so be careful entering values**
- If you find any error in below apis pls raise comment

# register api

- api -> post to <http://localhost:8090/register> body - user, pwd and role you want  
- JSON TAGS REQUIRED - (roleReq,yourName,password)
- optional tag -> "secretK" send it to directly save your id. Skip pendingRequest part.

```
- curl -X POST <http://localhost:8090/register> \
     -H "Content-Type: application/json" \
     -d '{"roleReq": "student/teacher/admin", "yourName": "name here","password":"8 digit pwd here", "secretK":"appky if you have one"}' 
```

# login api

- api -> used to login. output would be a token

```
- curl -X POST <http://localhost:8090/login> \
     -H "Content-Type: application/json" \
     -d '{"userId": 1, "password": "pass1234"}' 
```

# STUDENTS API

## you would always receive userCookie aka token string in form of "some string.some string.some string" eg - aaaa.bbbbbbb.cccc

## Display GET to <http://localhost:8090/student/display>

- it displays other students data according to information required

```
- curl -X GET <http://localhost:8090/student/display> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d '{"minPercent": 50}' 
```

- you can include other tags like viewByStd,viewBySection,maxPercent, single or multiple (view by section is string, rest are int)

## display list of subjects GET to <http://localhost:8090/student/displaySub>

- it displays subjects in particular standard
- JSON TAGS - (std)

```
- curl -X GET <http://localhost:8090/student/displaySub> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d '{"std": from 1 to 12}' 
```

## display report of logged in student GET to <http://localhost:8090/student/report>

- it displays report of that student who is logged in (token string jiski ho uska report)
- JSON TAGS - nothing, just send token in userCookie

```
- curl -X GET <http://localhost:8090/student/report> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \ 
```

### string.string.string is format in which you would receive token eg - aaaa.bbbbbbb.cccc

# TEACHERS API

## GET to <http://localhost:8090/teacher/studentreport>

- it allows any teacher to look any student's performance

```
- curl -X GET <http://localhost:8090/teacher/studentreport> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \ 
     -d {"grNo":student gr no int here}
```

## GET to <http://localhost:8090/teacher/displayPerformance>

- it displays performance of teacher logged in + performance of other teachers who are in same std assigned as logged in teacher eg- all teachers of standard x are displayed with total marks of students

```
- curl -X GET <http://localhost:8090/teacher/displayPerformance> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \ 
```

## POST to <http://localhost:8090/teacher/createStud>

- it created student
- JSON TAGS - (grNo,studPwd, userRole,studName std, section)

```
- curl -X POST <http://localhost:8090/teacher/createStud> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"grNo":int,"studPwd":"any string", "userRole":"not required to send but if u wish then student only","studName":"name", "std":int between 1 and 12, "section":"A OR B OR C... whatever you wish"} 
```

## PUT to <http://localhost:8090/teacher/updateStud>

- it updates student
- JSON TAGS - (grNo)required,  optional tags (studPwd, userRole,studName std, section)

```
- curl -X PUT <http://localhost:8090/teacher/updateStud> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"grNo":int student id,"studPwd":"any string", "userRole":"not required to send but if u wish then student only","studName":"name", "std":int between 1 and 12, "section":"A OR B OR C... whatever you wish"} 
```

## POST to <http://localhost:8090/teacher/createSub>

- it create subject
- JSON TAGS - (subId,subName,levelStd,credits)

```
- curl -X POST <http://localhost:8090/teacher/createSub> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"subId":int,"subName":"any name of subject string", "levelStd":"int->it is standard in which subject would be taken","credits":int->it is credit of subject} 
```

## PUT to <http://localhost:8090/teacher/updateSub>

- it updates subject
- JSON TAGS - (subId)required , optional tags (subName,levelStd,credits)

```
- curl -X PUT <http://localhost:8090/teacher/updateSub> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"subId":int,"subName":"any name of subject string", "levelStd":"int->it is standard in which subject would be taken","credits":int->it is credit of subject} 
```

## POST to <http://localhost:8090/teacher/enterMarks>

- it help to enter mark for particular student and respective subject
- JSON TAGS - (grNo, subId,theoryMarks,practicalMarks) all required

```
-  curl -X GET <http://localhost:8090/teacher/enterMarks> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"grNo":int student id,"subId":int ,"theoryMarks":int betw 0 and 80,"practicalMarks": int between 0 and 20} 
```

## PUT to <http://localhost:8090/teacher/updateMarks>

- it help to update mark for particular student and respective subject
- JSON TAGS - (grNo, subId) required ones , optional ones (theoryMarks,practicalMarks) use anyone or both or none

```
- curl -X PUT <http://localhost:8090/teacher/updateMarks> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"grNo":int here,"subId":int here, ... enter theoryMarks,practicalMarks in int form which ever or both as you need} 
```

## GET to <http://localhost:8090/teacher/displaySub>

- it displays subjects in subjects
- JSON TAGS - (std)

```
- curl -X GET <http://localhost:8090/teacher/displaySub> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"std":int here} 
```

## POST to <http://localhost:8090/teacher/addReview>

- it help to add review for student
- JSON TAGS - (grNo,comment)

```
- curl -X POST <http://localhost:8090/teacher/addReview> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"grNo":int,"comment":"any string eg - sincere student, acha baccha etc"} 
```

## DELETE to <http://localhost:8090/teacher/delSubject>

- it help to DELETE SUBJECTS
- JSON TAGS - (subid)

```
- curl -X DELETE <http://localhost:8090/teacher/delSubject> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"subid":give id here} 
```

## DELETE to <http://localhost:8090/teacher/delStudent>

- it help to DELETE students
- JSON TAGS - (grNo)

```
- curl -X DELETE http://localhost:8090/teacher/delStudent \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"grNo":int,"studPwd":"any string", "userRole":"not required to send but if u wish then student only","studName":"name", "std":int between 1 and 12, "section":"A OR B OR C... whatever you wish"}
```

# ADMINS API

## GET to <http://localhost:8090/admin/pendingRequest>

- it displays registeration requests from register
- JSON TAGS - ()nothing just hit the api

```
- curl -X GET <http://localhost:8090/admin/pendingRequest> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
```

## POST to <http://localhost:8090/admin/acceptRequest>

- it displays registeration requests from register
- JSON TAGS - (uName,uPwd,uRole)required ones,  tags filled according to role (std,section,subId) these arent required ones, can be sent optionally

```
- curl -X POST <http://localhost:8090/admin/acceptRequest> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"uName":"name of user in registeration request","uPwd":"his pwd", "uRole":"role he selected","std":int here as above,"section": "string as above",subId:"send this is role is teacher and is assigned subject else not needed" }
```

## DELETE to <http://localhost:8090/admin/rejectRequest>

- it displays registeration requests from register
- JSON TAGS - (uName,uPwd,uRole)required ones
- here tags would be automatically sent from ui

```
- curl -X DELETE <http://localhost:8090/admin/rejectRequest> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"uName":"name of user in registeration request","uPwd":"his pwd", "uRole":"role he selected"}
```

## DELETE to <http://localhost:8090/admin/delTeacher>

- it deleted teacher out of existence
- JSON TAGS - (teacherId)

```
-  curl -X DELETE <http://localhost:8090/admin/delTeacher> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"teacherId":"string of tId"} 
```

## POST to <http://localhost:8090/admin/addTeacher>

- it creates teacher new teacher in the table
- JSON TAGS - (teacherId,tPwd,role,tName) required ones
- additional tags - (subId,stdAllocated,sectionAllocated) (subject she teaches, and class she is assigned(last 2 tags) )

```
-  curl -X DELETE <http://localhost:8090/admin/addTeacher> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"teacherId":"string of tId","tPwd":"password here","role":"teacher","tName":"his/her name", ....append additional tags accordingly} 
```

## PUT to <http://localhost:8090/admin/editTeacher>

- it edits existing teacher data
- additional tags - (subId,stdAllocated,sectionAllocated) (subject she teaches, and class she is assigned(last 2 tags) )

```
-  curl -X DELETE <http://localhost:8090/admin/editTeacher> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"teacherId":"string of tId","tPwd":"password here","role":"teacher","tName":"his/her name", ....append additional tags accordingly}
```

## Display GET to <http://localhost:8090/admin/display>

- it displays other students data according to information required

```
- curl -X GET <http://localhost:8090/admin/display> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d '{"minPercent": 50}' 
```

- you can include other tags like viewByStd,viewBySection,maxPercent, single or multiple (view by section is string, rest are int)

## display list of subjects GET to <http://localhost:8090/admin/displaySub>

- it displays subjects in particular standard
- JSON TAGS - (std)

```
- curl -X GET <http://localhost:8090/admin/displaySub> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d '{"std": from 1 to 12}' 
```

## display report of logged in student GET to <http://localhost:8090/admin/report>

- it displays report of that student who is logged in (token string jiski ho uska report)
- JSON TAGS - nothing, just send token in userCookie

```
- curl -X GET <http://localhost:8090/admin/report> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \ 
     -d '{"grNo": student id here}' 
```

## GET to <http://localhost:8090/admin/displayPerformance>

- it displays performance of teacher logged in + performance of other teachers who are in same std assigned as logged in teacher eg- all teachers of standard x are displayed with total marks of students

```
- curl -X GET <http://localhost:8090/admin/displayPerformance> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \ 
     -d "{tid: "teacher id here"}"
```

## POST to <http://localhost:8090/admin/createStud>

- it created student
- JSON TAGS - (grNo,studPwd, userRole,studName std, section)

```
- curl -X POST <http://localhost:8090/admin/createStud> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"grNo":int,"studPwd":"any string", "userRole":"not required to send but if u wish then student only","studName":"name", "std":int between 1 and 12, "section":"A OR B OR C... whatever you wish"} 
```

## PUT to <http://localhost:8090/admin/updateStud>

- it updates student
- JSON TAGS - (grNo)required,  optional tags (studPwd, userRole,studName std, section)

```
- curl -X PUT <http://localhost:8090/admin/updateStud> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"grNo":int student id,"studPwd":"any string", "userRole":"not required to send but if u wish then student only","studName":"name", "std":int between 1 and 12, "section":"A OR B OR C... whatever you wish"} 
```

## POST to <http://localhost:8090/admin/createSub>

- it create subject
- JSON TAGS - (subId,subName,levelStd,credits)

```
- curl -X POST <http://localhost:8090/admin/createSub> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"subId":int,"subName":"any name of subject string", "levelStd":"int->it is standard in which subject would be taken","credits":int->it is credit of subject} 
```

## PUT to <http://localhost:8090/admin/updateSub>

- it updates subject
- JSON TAGS - (subId)required , optional tags (subName,levelStd,credits)

```
- curl -X PUT <http://localhost:8090/admin/updateSub> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"subId":int,"subName":"any name of subject string", "levelStd":"int->it is standard in which subject would be taken","credits":int->it is credit of subject} 
```

## POST to <http://localhost:8090/admin/enterMarks>

- it help to enter mark for particular student and respective subject
- JSON TAGS - (grNo, subId,theoryMarks,practicalMarks) all required

```
-  curl -X GET <http://localhost:8090/admin/enterMarks> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"grNo":int student id,"subId":int ,"theoryMarks":int betw 0 and 80,"practicalMarks": int between 0 and 20} 
```

## PUT to <http://localhost:8090/admin/updateMarks>

- it help to update mark for particular student and respective subject
- JSON TAGS - (grNo, subId) required ones , optional ones (theoryMarks,practicalMarks) use anyone or both or none

```
- curl -X PUT <http://localhost:8090/admin/updateMarks> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"grNo":int here,"subId":int here, ... enter theoryMarks,practicalMarks in int form which ever or both as you need} 
```

## DELETE to <http://localhost:8090/admin/delSubject>

- it help to DELETE SUBJECTS
- JSON TAGS - (subid)

```
- curl -X DELETE <http://localhost:8090/admin/delSubject> \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"subid":give id here} 
```

## DELETE to <http://localhost:8090/admin/delStudent>

- it help to DELETE students
- JSON TAGS - (grNo)

```
- curl -X DELETE http://localhost:8090/admin/delStudent \
     -H "Content-Type: application/json" \
     -b "userCookie=string.string.string" \
     -d {"grNo":int,"studPwd":"any string", "userRole":"not required to send but if u wish then student only","studName":"name", "std":int between 1 and 12, "section":"A OR B OR C... whatever you wish"}
```
