import { redirect } from 'next/navigation';

export default function LLMPage() {
    redirect('/admin/llm/models');
}