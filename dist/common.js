// Tìm node gần nhất với tọa độ lat, lon
function nearestNeighbour(lat, lon) {
    let data = JSON.parse(localStorage.getItem('data'));
    if (!data) {
        console.error("Không có dữ liệu nodes");
        return null;
    }
    let id = null;
    let gd = Infinity;

    for (let key in data) {
        let d = distance(lat, lon, data[key].lat, data[key].lon);

        if (d < gd) {
            gd = d;
            id = key;
        }
    }

    if (!id || !data[id]) {
        console.error("Không tìm thấy node phù hợp");
        return null;
    }

    return {
        id: id,
        data: data[id],
        lat: data[id].lat,
        lng: data[id].lon
    };
}

// Tìm đường đi từ node đầu đến node cuối
function constructPath(node, algo) {
    if (!node) {
        console.error(`${algo}: Không có đường đi`);
        return null;
    }

    let path = [];
    let pathFull = [];
    let current = node;

    try {
        // Tạo đường đi từ node cuối về node đầu
        while (current) {
            if (!current.lat || !current.lon) {
                console.error(`${algo}: Node thiếu tọa độ`, current);
                break;
            }

            pathFull.push({
                id: current.id,
                lat: current.lat,
                lon: current.lon
            });

            path.push([current.lat, current.lon]);
            current = current.parent;
        }

        // Đảo ngược để có thứ tự từ điểm đầu đến điểm cuối
        path = path.reverse();
        pathFull = pathFull.reverse();
        let totalDistance = 0;
        for (let i = 0; i < pathFull.length - 1; i++) {
            let curr = pathFull[i];
            let next = pathFull[i + 1];
            let segmentDistance = getDistance(
                curr.lat, curr.lon,
                next.lat, next.lon
            );
            totalDistance += segmentDistance;
        }

        console.log(`Total number nodes ${algo}:`, pathFull.length);
        console.log(`Total distance ${algo}: ${totalDistance.toFixed(6)} km`);

        return path;
    } catch (error) {
        console.error(`Lỗi trong constructPath (${algo}):`, error);
        console.error('Node gây lỗi:', current);
        return null;
    }
}

// Tính khoảng cách giữa 2 điểm trên mặt cầu
function getDistance(lat1, lon1, lat2, lon2) {
    // Chuyển đổi độ sang radian
    const R = 6371; // Bán kính trái đất (km)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    // Kiểm tra kết quả
    if (isNaN(distance)) {
        console.error('Lỗi tính khoảng cách:', {
            lat1, lon1, lat2, lon2,
            result: distance
        });
        return 0;
    }

    return distance;
}


// Khoảng cách Euclid giữa 2 điểm 
function distance(lat1, lon1, lat2, lon2) {
    let d1 = Math.abs(lat1 - lat2) * Math.abs(lat1 - lat2);
    let d2 = Math.abs(lon1 - lon2) * Math.abs(lon1 - lon2);
    return Math.sqrt(d1 + d2);
}
