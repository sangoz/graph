function dijkstra(start, end) {
    console.log("Dijkstra start:", start, "end:", end);
    const data = JSON.parse(localStorage.getItem('data'));

    if (!data || !data[start] || !data[end]) {
        console.error("Dữ liệu không hợp lệ cho Dijkstra");
        return null;
    }

    const distances = {};
    const previous = {};
    const unvisited = new Set();

    // Khởi tạo
    for (let node in data) {
        distances[node] = Infinity;
        previous[node] = null;
        unvisited.add(node);
    }
    distances[start] = 0;

    while (unvisited.size > 0) {
        // Tìm node gần nhất
        let current = null;
        let minDistance = Infinity;
        for (let node of unvisited) {
            if (distances[node] < minDistance) {
                minDistance = distances[node];
                current = node;
            }
        }

        if (current === null || current === end) break;

        unvisited.delete(current);

        // Xử lý các node kề
        if (data[current] && data[current].con) {
            for (let neighbor of data[current].con) {
                if (!unvisited.has(neighbor)) continue;

                const dist = getDistance(
                    data[current].lat, data[current].lon,
                    data[neighbor].lat, data[neighbor].lon
                );
                const altDistance = distances[current] + dist;

                if (altDistance < distances[neighbor]) {
                    distances[neighbor] = altDistance;
                    previous[neighbor] = current;
                }
            }
        }
    }

    // Tạo đường đi
    if (!previous[end]) {
        console.error("Không tìm thấy đường đi Dijkstra");
        return null;
    }

    const result = {
        id: end,
        lat: data[end].lat,
        lon: data[end].lon,
        parent: null
    };

    let current = end;
    let node = result;
    while (previous[current]) {
        const prevId = previous[current];
        const prevNode = {
            id: prevId,
            lat: data[prevId].lat,
            lon: data[prevId].lon,
            parent: null
        };
        node.parent = prevNode;
        node = prevNode;
        current = prevId;
    }

    return result;
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
} 