import type { User } from 'types/User'
import type { Tenant } from 'types/Tenant'

export interface UserTenants extends User {
    Tenants: Tenant[]
}
