<script setup>
import { computed } from "vue";

const props = defineProps({
  license: String,
  title: String,
  size: String,
  addon: String,
  addon_link: String,
});
const license = computed(() => props.license || "community");
const size = computed(() => props.size || "sm");
const links = {
  community: "https://avohq.io/pricing#comparison-heading",
  pro: "https://avohq.io/subscriptions/new?plan=pro",
  advanced: "https://avohq.io/subscriptions/new?plan=advanced",
  kanban: "https://savvycal.com/adrianthedev/avo-addon-talk?questions[0]=kanban",
  audit_logging: "https://savvycal.com/adrianthedev/avo-addon-talk?questions[0]=audit_logging",
  custom: "https://savvycal.com/adrianthedev/avo-addon-talk?questions[0]=custom",
  addon: "https://savvycal.com/adrianthedev/avo-addon-talk?questions[0]=add_on", // this is different from the other addon links
  addon_blank: "https://savvycal.com/adrianthedev/avo-addon-talk?questions[0]=", // this is different from the other addon links
  mixed: "https://avohq.io/pricing#comparison-heading",
  enterprise: "https://savvycal.com/avo-hq/discovery-call-ent",
};
const labels = {
  community: "Community",
  pro: "Pro",
  advanced: "Advanced",
  kanban: "Kanban",
  enterprise: "Enterprise",
  audit_logging: "Audit logging",
  custom: "Custom",
  addon: "Add-on",
  mixed: "Community + Add-on",
};

const href = computed(() => {
  if (props.addon_link) {
    return props.addon_link;
  }
  if (props.addon) {
    return links.addon_blank + props.addon;
  }
  return links[license.value];
});
const label = computed(() => labels[license.value]);
</script>

<template>
  <a :href="href" target="_blank" :title="title"
    class="inline-flex items-center rounded !no-underline leading-none !text-white" :class="{
      'bg-green-500 hover:bg-green-600': license == 'community',
      'bg-blue-500 hover:bg-blue-600': license == 'pro',
      'bg-violet-500 hover:bg-violet-600': license == 'advanced',
      'bg-fuchsia-500 hover:bg-fuchsia-600': license == 'kanban',
      'bg-teal-500 hover:bg-teal-600': license == 'audit_logging',
      'bg-rose-500 hover:bg-rose-600': license == 'custom',
      'bg-rose-500 hover:bg-rose-600': license == 'addon',
      'bg-amber-500 hover:bg-amber-600': license == 'mixed',
      'bg-yellow-300 hover:bg-yellow-400 !text-black': license == 'enterprise',
      'text-xs px-1 py-px': size == 'xs',
      'text-sm px-2 py-1': size == 'sm',
    }">
    <CheckBadgeIcon class="h-4 inline mr-1" /> License: {{ label }}
  </a>
</template>
