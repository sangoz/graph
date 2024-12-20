function bfs(startId, goalId) {
    let data = JSON.parse(localStorage.getItem('data'));
    if (!data || !data[startId] || !data[goalId]) {
        console.error("Dữ liệu không hợp lệ cho BFS");
        return null;
    }

    let queue = [{
        id: startId,
        path: 0,
        parent: null,
        lat: data[startId].lat,
        lon: data[startId].lon
    }];
    let visited = new Set();

    while (queue.length > 0) {
        let current = queue.shift();
        if (current.id == goalId) {
            return current;
        }

        if (!visited.has(current.id)) {
            visited.add(current.id);
            let children = getChildrenBfs(current, data);
            for (let child of children) {
                if (!visited.has(child.id)) {
                    queue.push(child);
                }
            }
        }
    }
    return null;
}

function getChildrenBfs(parent, data) {
    let children = [];
    if (data[parent.id] && data[parent.id].con) {
        for (let c of data[parent.id].con) {
            if (data[c]) {
                children.push({
                    id: c,
                    lat: data[c].lat,
                    lon: data[c].lon,
                    parent: parent
                });
            }
        }
    }
    return children;
}
