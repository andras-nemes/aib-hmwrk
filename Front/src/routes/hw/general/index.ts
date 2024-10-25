import { RouteNames } from 'routes/constants'

export const general = {
    path: 'general',
    name: RouteNames.General,
    redirect: { name: RouteNames.Introduction },
    component: () => import('views/general/GeneralView.vue'),
    meta: {
        breadcrumb: [
            {
                name: 'views.general.title',
                icon: 'fa fa-home',
            },
        ],
    },
    children: [
        {
            path: 'introduction',
            name: RouteNames.Introduction,
            component: () => import('views/general/IntroductionView.vue'),
            meta: {
                breadcrumb: [
                    {
                        name: 'views.general.introduction.title',
                        icon: 'fa fa-home',
                    },
                ],
            },
        },
        {
            path: 'resumetable',
            name: RouteNames.ResumeTable,
            component: () => import('views/general/ResumeTableView.vue'),
            meta: {
                breadcrumb: [
                    {
                        name: 'Resume Table',
                        icon: 'fa fa-home',
                    },
                ],
            },
        },
        {
            path: 'resumeform',
            name: RouteNames.ResumeForm,
            component: () => import('views/general/ResumeFormView.vue'),
            meta: {
                breadcrumb: [
                    {
                        name: 'Resume Form',
                        icon: 'fa fa-project-diagram',
                    },
                ],
            },
        },
    ],
}
