<script setup>
import { computed } from "vue";

const props = defineProps({
  license: String,
  title: String,
  size: String,
});
const license = computed(() => props.license || "community");
const size = computed(() => props.size || "sm");
const links = {
  community: "https://avohq.io/pricing#comparison-heading",
  pro: "https://avohq.io/subscriptions/new?plan=pro",
  advanced: "https://avohq.io/subscriptions/new?plan=advanced",
  kanban: "https://savvycal.com/avo-hq/dev-chat-24",
  audit_logging: "https://savvycal.com/avo-hq/dev-chat-24",
  custom: "https://savvycal.com/avo-hq/dev-chat-24",
  add_on: "https://savvycal.com/avo-hq/dev-chat-24",
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
  add_on: "Add-on",
};
const href = computed(() => links[license.value]);
const label = computed(() => labels[license.value]);
</script>

<template>
  <a
    :href="href"
    target="_blank"
    :title="title"
    class="inline-flex items-center rounded !no-underline leading-none !text-white"
    :class="{
      'bg-green-500 hover:bg-green-600': license == 'community',
      'bg-blue-500 hover:bg-blue-600': license == 'pro',
      'bg-violet-500 hover:bg-violet-600': license == 'advanced',
      'bg-fuchsia-500 hover:bg-fuchsia-600': license == 'kanban',
      'bg-teal-500 hover:bg-teal-600': license == 'audit_logging',
      'bg-rose-500 hover:bg-rose-600': license == 'custom',
      'bg-rose-500 hover:bg-rose-600': license == 'add_on',
      'bg-yellow-300 hover:bg-yellow-400 !text-black': license == 'enterprise',
      'text-xs px-1 py-px': size == 'xs',
      'text-sm px-2 py-1': size == 'sm',
    }"
  >
    <CheckBadgeIcon class="h-4 inline mr-1" /> License: {{ label }}
  </a>
</template>
