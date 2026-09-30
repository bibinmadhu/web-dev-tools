import { ChessInputFormat } from './chessConverter';

export interface ChessPreset {
  id: string;
  name: string;
  format: ChessInputFormat;
  description: string;
  badge: string;
  moveCount: number;
  data: string;
}

export const USER_ATTACHED_CHESS_HTML = `<div style="--timeMaxValue: 0; --timestampWidth: 0px">
    <div class="main-line-row move-list-row light-row" data-whole-move-number="1">
        1.
        <div data-node="0-0" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">d4 </span>
        </div>
        <div data-node="0-1" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-black" data-figurine="N"></span> f6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="2">
        2.
        <div data-node="0-2" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-white" data-figurine="N"></span> f3
            </span>
        </div>
        <div data-node="0-3" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">e6 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="3">
        3.
        <div data-node="0-4" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">e3 </span>
        </div>
        <div data-node="0-5" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">c5 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="4">
        4.
        <div data-node="0-6" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-white" data-figurine="B"></span> d2
            </span>
        </div>
        <div data-node="0-7" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess queen-black" data-figurine="Q"></span> b6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="5">
        5.
        <div data-node="0-8" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-white" data-figurine="B"></span> c3
            </span>
        </div>
        <div data-node="0-9" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-black" data-figurine="R"></span> g8
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="6">
        6.
        <div data-node="0-10" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-white" data-figurine="N"></span> bd2
            </span>
        </div>
        <div data-node="0-11" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-black" data-figurine="B"></span> e7
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="7">
        7.
        <div data-node="0-12" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-white" data-figurine="B"></span> e2
            </span>
        </div>
        <div data-node="0-13" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-black" data-figurine="N"></span> d5
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="8">
        8.
        <div data-node="0-14" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">O-O </span>
        </div>
        <div data-node="0-15" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-black" data-figurine="N"></span> xc3
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="9">
        9.
        <div data-node="0-16" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">bxc3 </span>
        </div>
        <div data-node="0-17" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess queen-black" data-figurine="Q"></span> a5
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="10">
        10.
        <div data-node="0-18" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-white" data-figurine="N"></span> e4
            </span>
        </div>
        <div data-node="0-19" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">d5 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="11">
        11.
        <div data-node="0-20" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-white" data-figurine="N"></span> xc5
            </span>
        </div>
        <div data-node="0-21" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">b6 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="12">
        12.
        <div data-node="0-22" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-white" data-figurine="N"></span> b3
            </span>
        </div>
        <div data-node="0-23" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess queen-black" data-figurine="Q"></span> xc3
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="13">
        13.
        <div data-node="0-24" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess queen-white" data-figurine="Q"></span> d3
            </span>
        </div>
        <div data-node="0-25" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess queen-black" data-figurine="Q"></span> xd3
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="14">
        14.
        <div data-node="0-26" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-white" data-figurine="B"></span> xd3
            </span>
        </div>
        <div data-node="0-27" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">h6 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="15">
        15.
        <div data-node="0-28" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">e4 </span>
        </div>
        <div data-node="0-29" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">g5 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="16">
        16.
        <div data-node="0-30" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">exd5 </span>
        </div>
        <div data-node="0-31" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">g4 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="17">
        17.
        <div data-node="0-32" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-white" data-figurine="N"></span> e5
            </span>
        </div>
        <div data-node="0-33" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">a5 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="18">
        18.
        <div data-node="0-34" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">d6 </span>
        </div>
        <div data-node="0-35" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-black" data-figurine="B"></span> f8
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="19">
        19.
        <div data-node="0-36" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-white" data-figurine="B"></span> e4
            </span>
        </div>
        <div data-node="0-37" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-black" data-figurine="R"></span> a6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="20">
        20.
        <div data-node="0-38" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> fe1
            </span>
        </div>
        <div data-node="0-39" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">a4 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="21">
        21.
        <div data-node="0-40" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-white" data-figurine="N"></span> d2
            </span>
        </div>
        <div data-node="0-41" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-black" data-figurine="R"></span> g5
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="22">
        22.
        <div data-node="0-42" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-white" data-figurine="B"></span> d3
            </span>
        </div>
        <div data-node="0-43" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-black" data-figurine="B"></span> xd6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="23">
        23.
        <div data-node="0-44" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-white" data-figurine="B"></span> xa6
            </span>
        </div>
        <div data-node="0-45" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-black" data-figurine="B"></span> xa6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="24">
        24.
        <div data-node="0-46" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-white" data-figurine="N"></span> e4
            </span>
        </div>
        <div data-node="0-47" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-black" data-figurine="B"></span> xe5
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="25">
        25.
        <div data-node="0-48" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-white" data-figurine="N"></span> xg5
            </span>
        </div>
        <div data-node="0-49" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-black" data-figurine="B"></span> xd4
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="26">
        26.
        <div data-node="0-50" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> ad1
            </span>
        </div>
        <div data-node="0-51" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess bishop-black" data-figurine="B"></span> f6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="27">
        27.
        <div data-node="0-52" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-white" data-figurine="N"></span> e4
            </span>
        </div>
        <div data-node="0-53" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> e7
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="28">
        28.
        <div data-node="0-54" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-white" data-figurine="N"></span> xf6
            </span>
        </div>
        <div data-node="0-55" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> xf6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="29">
        29.
        <div data-node="0-56" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> d6
            </span>
        </div>
        <div data-node="0-57" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">h5 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="30">
        30.
        <div data-node="0-58" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> xb6
            </span>
        </div>
        <div data-node="0-59" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-black" data-figurine="N"></span> d7
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="31">
        31.
        <div data-node="0-60" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> xa6
            </span>
        </div>
        <div data-node="0-61" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-black" data-figurine="N"></span> b8
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="32">
        32.
        <div data-node="0-62" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> xa4
            </span>
        </div>
        <div data-node="0-63" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-black" data-figurine="N"></span> c6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="33">
        33.
        <div data-node="0-64" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> f4+
            </span>
        </div>
        <div data-node="0-65" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> g5
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="34">
        34.
        <div data-node="0-66" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> c4
            </span>
        </div>
        <div data-node="0-67" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess knight-black" data-figurine="N"></span> a5
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="35">
        35.
        <div data-node="0-68" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> e5+
            </span>
        </div>
        <div data-node="0-69" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> g6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="36">
        36.
        <div data-node="0-70" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> xa5
            </span>
        </div>
        <div data-node="0-71" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">f6 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="37">
        37.
        <div data-node="0-72" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> c6
            </span>
        </div>
        <div data-node="0-73" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">e5 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="38">
        38.
        <div data-node="0-74" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> aa6
            </span>
        </div>
        <div data-node="0-75" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> g5
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="39">
        39.
        <div data-node="0-76" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> xf6
            </span>
        </div>
        <div data-node="0-77" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">h4 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="40">
        40.
        <div data-node="0-78" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> g6+
            </span>
        </div>
        <div data-node="0-79" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> f5
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="41">
        41.
        <div data-node="0-80" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> af6+
            </span>
        </div>
        <div data-node="0-81" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> e4
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="42">
        42.
        <div data-node="0-82" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> xg4+
            </span>
        </div>
        <div data-node="0-83" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> d5
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="43">
        43.
        <div data-node="0-84" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> xh4
            </span>
        </div>
        <div data-node="0-85" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">e4 </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="44">
        44.
        <div data-node="0-86" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> ff4
            </span>
        </div>
        <div data-node="0-87" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> e6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="45">
        45.
        <div data-node="0-88" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> xe4+
            </span>
        </div>
        <div data-node="0-89" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> f5
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="46">
        46.
        <div data-node="0-90" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> e3
            </span>
        </div>
        <div data-node="0-91" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> g5
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="47">
        47.
        <div data-node="0-92" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">g3 </span>
        </div>
        <div data-node="0-93" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> g6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="48">
        48.
        <div data-node="0-94" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> ee4
            </span>
        </div>
        <div data-node="0-95" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> f5
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="49">
        49.
        <div data-node="0-96" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">f3 </span>
        </div>
        <div data-node="0-97" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> f6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="50">
        50.
        <div data-node="0-98" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">f4 </span>
        </div>
        <div data-node="0-99" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> g7
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="51">
        51.
        <div data-node="0-100" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> e5
            </span>
        </div>
        <div data-node="0-101" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> f7
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="52">
        52.
        <div data-node="0-102" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> hh5
            </span>
        </div>
        <div data-node="0-103" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> g6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="53">
        53.
        <div data-node="0-104" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> hf5
            </span>
        </div>
        <div data-node="0-105" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> g7
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="54">
        54.
        <div data-node="0-106" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">h4 </span>
        </div>
        <div data-node="0-107" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> g6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="55">
        55.
        <div data-node="0-108" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">h5+ </span>
        </div>
        <div data-node="0-109" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> h7
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="56">
        56.
        <div data-node="0-110" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">g4 </span>
        </div>
        <div data-node="0-111" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> h6
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="57">
        57.
        <div data-node="0-112" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess rook-white" data-figurine="R"></span> f6+
            </span>
        </div>
        <div data-node="0-113" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> g7
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row dark-row" data-whole-move-number="58">
        58.
        <div data-node="0-114" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">g5 </span>
        </div>
        <div data-node="0-115" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> g8
            </span>
        </div>
    </div>
    <div class="main-line-row move-list-row light-row" data-whole-move-number="59">
        59.
        <div data-node="0-116" class="node white-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon">g6 </span>
        </div>
        <div data-node="0-117" class="node black-move main-line-ply">
            <span class="node-highlight-content offset-for-annotation-icon selected"
                ><span class="icon-font-chess king-black" data-figurine="K"></span> g7
            </span>
        </div>
    </div>
</div>`;

export const CHESS_PRESETS: ChessPreset[] = [
  {
    id: 'user-attached-snippet',
    name: 'Attached Chess.com HTML Move Map',
    format: 'chess_com_html',
    description: 'The user-provided 59-move game HTML snippet with figurine icons, classes & nodes',
    badge: 'Attached HTML',
    moveCount: 59,
    data: USER_ATTACHED_CHESS_HTML,
  },
  {
    id: 'opera-game',
    name: 'The Opera Game (Morphy vs Brunswick, 1858)',
    format: 'pgn',
    description: 'Classic queen sacrifice and checkmate by Paul Morphy at the Paris Opera',
    badge: 'PGN Standard',
    moveCount: 17,
    data: `[Event "A Casual Game"]
[Site "Paris Opera House"]
[Date "1858.11.02"]
[Round "1"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`,
  },
  {
    id: 'immortal-game',
    name: 'The Immortal Game (Anderssen vs Kieseritzky, 1851)',
    format: 'san_moves',
    description: 'Double rook & queen sacrifice ending in minor piece checkmate',
    badge: 'SAN Moves',
    moveCount: 23,
    data: `1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7#`,
  },
  {
    id: 'kasparov-topalov-uci',
    name: 'Kasparov vs Topalov (UCI Format)',
    format: 'uci_lan',
    description: 'Kasparov’s immortal king hunt in pure UCI coordinate notation',
    badge: 'UCI / LAN',
    moveCount: 44,
    data: `e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 c1e3 f8g7 d1d2 c7c6 f2f3 b7b5 g1e2 b8d7 e3h6 g7h6 d2h6 c8b7 a2a3 e7e5 e1c1 d8e7 c1b1 a7a6 e2c1 e8c8 c1b3 e5d4 d1d4 c6c5 d4d1 d7b6 g2g3 c8b8 b3a5 b7a8 f1h3 d6d5 h6f4 b8a7 h1e1 d5d4 c3d5 b6d5 e4d5 e7d6 d1d4 c5d4 e1e7 a7b6 f4d4 b6a5 b2b4 a5a4 d4c3 d6d5 e7a7 a8b7 a7b7 d5c4 c3f6 a4a3 f6a6 a3b4 c2c3 b4c3 a6a1 c3d2 a1b2 d2d1 h3f1 d8d2 f1c4 d2b2 b1b2 b5c4 b7f7 d1e2 b2c3 e2f3 f7f6 f3g2 f6f4 g2h2 g3g4 h2g3 f4c4`,
  },
  {
    id: 'json-move-map',
    name: 'JSON Move Map Array',
    format: 'json_moves',
    description: 'Structured array of moves in JSON notation',
    badge: 'JSON Array',
    moveCount: 10,
    data: `[
  { "move": 1, "white": "e4", "black": "c5" },
  { "move": 2, "white": "Nf3", "black": "d6" },
  { "move": 3, "white": "d4", "black": "cxd4" },
  { "move": 4, "white": "Nxd4", "black": "Nf6" },
  { "move": 5, "white": "Nc3", "black": "a6" },
  { "move": 6, "white": "Be3", "black": "e5" },
  { "move": 7, "white": "Nb3", "black": "Be6" },
  { "move": 8, "white": "f3", "black": "Be7" },
  { "move": 9, "white": "Qd2", "black": "O-O" },
  { "move": 10, "white": "O-O-O", "black": "Nbd7" }
]`,
  },
  {
    id: 'columnar-text-sample',
    name: 'Two-Column Move List Text',
    format: 'columnar_text',
    description: 'Clean whitespace-separated columnar move sheet',
    badge: '2-Column',
    moveCount: 8,
    data: `1.  d4      d5
2.  c4      e6
3.  Nc3     Nf6
4.  cxd5    exd5
5.  Bg5     c6
6.  e3      Be7
7.  Bd3     O-O
8.  Qc2     Nbd7`,
  },
];
