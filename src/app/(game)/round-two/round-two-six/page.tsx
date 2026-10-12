import GameOverScreen from "@/components/roundTwo/gameOver/GameOver";

const page = () => {
  return (
    <div className= "bg-[url('/p-bg.png')] bg-cover  bg-no-repeat min-h-screen">
      <GameOverScreen />
    </div>
  );
};

export default page;
