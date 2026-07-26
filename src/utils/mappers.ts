interface ApiUser {
  id: number
  family_name: string
  email: string
}

interface User {
  id: number
  name: string
  email: string
}

function mapUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.family_name,
    email: apiUser.email
  }
}

function mapUser2(user: User) {
  user.name = user.name + ' con email: ' + user.email;
  return user
}

export { mapUser, mapUser2 }