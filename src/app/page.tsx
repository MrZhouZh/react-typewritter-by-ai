import Chat from '../components/Chat';

export default function Home() {
  return (
    <main className="h-screen p-4 pt-0 overflow-hidden">
      <div className="h-full max-w-4xl mx-auto">
        <Chat />
      </div>
    </main>
  );
}
