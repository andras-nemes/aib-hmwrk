import { RouteNames } from 'routes/constants'
import { general } from 'routes/hw/general'

export const hw = {
    path: '/client',
    props: true,
    name: 'Aibidia Homework',
    redirect: { name: RouteNames.Introduction },
    component: () => import('components/AppContainer.vue'),
    meta: {
        breadcrumb: [{ name: 'views.title', icon: 'fa fa-chart-bar' }],
    },
    children: [general],
}
