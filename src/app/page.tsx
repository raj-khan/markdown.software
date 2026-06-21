import { Header } from "@/components/Header";
import { Editor } from "@/components/Editor";

export default function Home() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <Header />
      <Editor />
    </main>
  );
}
