const fs = require('fs');
let code = fs.readFileSync('src/components/GroupDetailRoom.tsx', 'utf8');

// Tasks
code = code.replace(
  /\.slice\(\(groupTaskPage - 1\) \* 5, groupTaskPage \* 5\)/,
  '.slice(0, groupTaskPage * 5)'
);
code = code.replace(
  /<MobilePagination\s+currentPage=\{groupTaskPage\}\s+totalItems=\{filteredTasks\.length\}\s+pageSize=\{5\}\s+onPageChange=\{setGroupTaskPage\}\s+itemLabel="tugas"\s+className="mt-3"\s+\/>/m,
  `<MobilePagination
                currentPage={1}
                totalItems={filteredTasks.length}
                pageSize={5}
                visibleCount={groupTaskPage * 5}
                mode="loadMore"
                onLoadMore={() => setGroupTaskPage(p => p + 1)}
                onPageChange={() => {}}
                itemLabel="tugas"
                className="mt-3"
              />`
);

// Transactions
code = code.replace(
  /\.slice\(\(groupTxPage - 1\) \* 6, groupTxPage \* 6\)/,
  '.slice(0, groupTxPage * 6)'
);
code = code.replace(
  /<MobilePagination\s+currentPage=\{groupTxPage\}\s+totalItems=\{groupTransactions\.length\}\s+pageSize=\{6\}\s+onPageChange=\{setGroupTxPage\}\s+itemLabel="transaksi"\s+className="mt-3"\s+\/>/m,
  `<MobilePagination
                currentPage={1}
                totalItems={groupTransactions.length}
                pageSize={6}
                visibleCount={groupTxPage * 6}
                mode="loadMore"
                onLoadMore={() => setGroupTxPage(p => p + 1)}
                onPageChange={() => {}}
                itemLabel="transaksi"
                className="mt-3"
              />`
);

// Posts
code = code.replace(
  /\.slice\(\(groupPostPage - 1\) \* 3, groupPostPage \* 3\)/,
  '.slice(0, groupPostPage * 5)'
);
code = code.replace(
  /<MobilePagination\s+currentPage=\{groupPostPage\}\s+totalItems=\{groupPosts\.length\}\s+pageSize=\{3\}\s+onPageChange=\{setGroupPostPage\}\s+itemLabel="kiriman wawasan"\s+className="mt-3"\s+\/>/m,
  `<MobilePagination
                currentPage={1}
                totalItems={groupPosts.length}
                pageSize={5}
                visibleCount={groupPostPage * 5}
                mode="loadMore"
                onLoadMore={() => setGroupPostPage(p => p + 1)}
                onPageChange={() => {}}
                itemLabel="kiriman wawasan"
                className="mt-3"
              />`
);

fs.writeFileSync('src/components/GroupDetailRoom.tsx', code);
