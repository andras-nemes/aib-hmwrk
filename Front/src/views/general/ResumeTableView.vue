<template>
    <Pane
        content-padding
        content-grow
    >
        <TablePageLayout>
            <template #title> Resume Table </template>
            <template #default>
                <Accordion :items="resumes" />
            </template>
        </TablePageLayout>
        
    </Pane>
    
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import Pane from 'components/shared/PaneLayout.vue'
import TablePageLayout from 'components/shared/TablePageLayout.vue'
import Card from 'components/shared/Card/CardLayout.vue'
import Accordion from 'components/shared/Accordion.vue'
import { useHomeworkApi } from 'lib/api/helpers/useApi'


 
interface Data {
    /** Page title */
    pageTitle: string
}

export default defineComponent({
    components: {
        Pane,
        TablePageLayout,
        Accordion
    },

    setup() {
        const resumes = ref<Array<{ Id: number; Title: string; Description: string }>>([]);

        // Fetch resumes asynchronously
        const fetchResumes = async () => {
            try {
                const response = await useHomeworkApi().resumes.get();
                resumes.value = response.map(resume => ({
                    Id: resume.Id,
                    Title: `${resume.FirstName} ${resume.LastName} - ${resume.Email}`,
                    Description: resume.Description,
                })); 
            } catch (error) {
                console.error("Error fetching resumes:", error);
            }
        };

        // Call fetchResumes when the component mounts
        onMounted(fetchResumes);

        return {
            resumes: resumes,
        };
    },

    data(): Data {
        return {
            pageTitle: 'Resume Table'
        }
    },
})
</script>
