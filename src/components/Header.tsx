import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-[#800020] text-white p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-do-hyeon">
          광운대학교 학과 안내 챗봇
        </h1>
        <a
          href="https://www.kw.ac.kr/ko/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
        >
          <img
            src="/hol.png"
            alt="광운대학교 홈페이지"
            className="h-8 w-auto sm:h-9 md:h-10 lg:h-12"
          />
        </a>
      </div>
    </header>
  );
};

export default Header;
