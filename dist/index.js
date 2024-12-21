let ab = true;
let aid = -1;
let bid = -1;
const mymap = L.map('mapid').setView([21.00269, 105.85159], 16);
const lineB = L.polyline([], { color: 'blue', weight: 3 }).addTo(mymap);
const lineD = L.polyline([], { color: 'red', weight: 3 }).addTo(mymap);
const a = L.marker([0, 0], { draggable: true }).addTo(mymap);
const b = L.marker([1, 1], { draggable: true }).addTo(mymap);

let currentPathB = [];
let currentIndexB = 0;
let currentPathD = [];
let currentIndexD = 0;

function renderPathPartially() {
    const offset = 0.00000;
    if (currentIndexB < currentPathB.length) {
        const latlngB = currentPathB[currentIndexB];
        const latlngBOffset = L.latLng(latlngB[0] + offset, latlngB[1] + offset);
        lineB.addLatLng(latlngBOffset);
        currentIndexB++;
        setTimeout(renderPathPartially, 200);
    }
    if (currentIndexD < currentPathD.length) {
        const latlngD = currentPathD[currentIndexD];
        const latlngDOffset = L.latLng(latlngD[0] + offset, latlngD[1] + offset);
        lineD.addLatLng(latlngDOffset);
        currentIndexD++;
        setTimeout(renderPathPartially, 200);
    }
}

function renderPathIncrementally(pathB) {
    // Reset đường đi cũ
    lineB.setLatLngs([]);
    lineD.setLatLngs([]);

    if (!pathB) {
        console.error("Không tìm thấy đường đi BFS");
        return;
    }

    // Chuyển đổi pathB thành mảng các điểm
    currentPathB = pathB;
    if (!currentPathB) return;
    currentIndexB = 0;

    // Tìm đường đi Dijkstra
    let dijkstraResult = dijkstra(aid, bid);
    let pathD = constructPath(dijkstraResult, 'Dijkstra');
    if (!pathD) {
        console.error("Không tìm thấy đường đi Dijkstra");
        return;
    }
    currentPathD = pathD;
    currentIndexD = 0;

    // Vẽ đường đi
    renderPathPartially();
}

mymap.on('click', (e) => {
    const data = JSON.parse(localStorage.getItem("data"));
    if (!data) {
        console.error("Chưa có dữ liệu map, vui lòng đợi tải xong");
        return;
    }

    let nn = nearestNeighbour(e.latlng["lat"], e.latlng["lng"]);
    if (!nn) {
        console.error("Không tìm thấy node gần nhất");
        return;
    }

    if (ab) {
        a.setLatLng([nn.lat, nn.lng]);
        aid = nn.id;
        ab = false;
    } else {
        b.setLatLng([nn.lat, nn.lng]);
        bid = nn.id;
        ab = true;
    }

    if (aid > 0 && bid > 0) {
        lineB.setLatLngs([]);
        lineD.setLatLngs([]);
        console.log("Tìm đường đi từ", aid, "đến", bid);

        let pathB = constructPath(bfs(aid, bid), 'BFS');

        renderPathIncrementally(pathB);

        aid = -1;
        bid = -1;
        ab = true;
    }
});


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
}).addTo(mymap);

fetch("map.json")
    .then(response => response.json())
    .then(data => {
        if (!data || !data.nodes) {
            console.error("Không tìm thấy dữ liệu nodes trong map.json");
            return;
        }
        localStorage.setItem("data", JSON.stringify(data.nodes));
        console.log("Đã tải dữ liệu thành công");

        // Đặt vị trí ban đầu cho markers
        const firstNode = Object.values(data.nodes)[0];
        if (firstNode) {
            a.setLatLng([firstNode.lat, firstNode.lon]);
            b.setLatLng([firstNode.lat + 0.001, firstNode.lon + 0.001]);
        }
    })
    .catch(error => {
        console.error("Lỗi khi tải map.json:", error);
    });

// Thêm hàm debug
function debugPath(path, algo) {
    console.log(`Debug ${algo} path:`, path);
    if (path && path.length > 0) {
        console.log(`First point: ${path[0]}`);
        console.log(`Last point: ${path[path.length - 1]}`);
    }
}