Perfect 👍 — here are **ready-to-use `curl` commands** for testing your full **Memorial CRUD API** (with MongoDB + Express).

I’ll assume your backend runs locally on
`http://localhost:5000/api/memorials`

---

## 🕊️ 1️⃣ Create a Memorial

```bash
curl -X POST http://localhost:5000/api/memorials \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "description": "A kind and loving person.",
    "createdBy": "user123"
  }'
```

**✅ Response:**

```json
{
  "message": "Memorial submitted for approval",
  "memorial": {
    "_id": "6716c3f1f26c84b2a59b6e72",
    "firstName": "John",
    "lastName": "Doe",
    "description": "A kind and loving person.",
    "createdBy": "user123",
    "approved": false,
    "createdAt": "2025-10-21T09:13:53.123Z",
    "updatedAt": "2025-10-21T09:13:53.123Z"
  }
}
```

---

## 📜 2️⃣ Get All Approved Memorials

```bash
curl -X GET http://localhost:5000/api/memorials
```

**✅ Tip:**
Add `?all=true` if you’re an admin and want to see **approved + unapproved**:

```bash
curl -X GET "http://localhost:5000/api/memorials?all=true"
```

---

## 🔍 3️⃣ Get Memorial by ID

Replace `<ID>` with the `_id` from the create response:

```bash
curl -X GET http://localhost:5000/api/memorials/<ID>
```

Example:

```bash
curl -X GET http://localhost:5000/api/memorials/6716c3f1f26c84b2a59b6e72
```

---

## ✏️ 4️⃣ Update a Memorial (before approval)

```bash
curl -X PUT http://localhost:5000/api/memorials/<ID> \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Johnny",
    "description": "Updated tribute text."
  }'
```

---

## ✅ 5️⃣ Approve a Memorial (admin only)

```bash
curl -X PUT http://localhost:5000/api/memorials/<ID>/approve
```

---

## 🗑️ 6️⃣ Delete a Memorial

```bash
curl -X DELETE http://localhost:5000/api/memorials/<ID>
```

---

## 💡 Bonus: If you also have authentication

Once you add JWT-based login for users/admins, you can just add:

```bash
-H "Authorization: Bearer <your_token>"
```

to each request.

---

Would you like me to also generate a **`.http` file** (for VS Code REST Client or Postman) with all these requests pre-formatted? It’s super handy for testing your API.


project-root/
│
├── .env
├── package.json
├── index.js
├── config/
│   └── database.js
├── models/
│   └── memorialModel.js
├── controllers/
│   └── memorialController.js
└── routes/
    └── memorialRoutes.js

    
| Method   | Endpoint                     | Description                         |
| -------- | ---------------------------- | ----------------------------------- |
| `POST`   | `/api/memorials`             | Create new memorial                 |
| `GET`    | `/api/memorials`             | Get approved memorials              |
| `GET`    | `/api/memorials?all=true`    | Admin: get all (approved + pending) |
| `GET`    | `/api/memorials/:id`         | Get one memorial                    |
| `PUT`    | `/api/memorials/:id`         | Update (only before approval)       |
| `DELETE` | `/api/memorials/:id`         | Delete memorial                     |
| `PUT`    | `/api/memorials/:id/approve` | Approve memorial (admin only)       |
