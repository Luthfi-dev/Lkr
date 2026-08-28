const fs = require('fs');
let code = fs.readFileSync('src/components/GroupDetailRoom.tsx', 'utf8');

// Tasks
code = code.replace(
  /\.slice\(\(groupTaskPage - 1\) \* 4, groupTaskPage \* 4\)/,
  '.slice(0, groupTaskPage * 5)'
);
code = code.replace(
  /<MobilePagination\s+currentPage=\{groupTaskPage\}\s+totalItems=\{filteredTasks\.length\}\s+pageSize=\{4\}\s+onPageChange=\{setGroupTaskPage\}\s+itemLabel="tugas tim"\s+className="mt-2"\s+\/>/m,
  `<MobilePagination
                currentPage={1}
                totalItems={filteredTasks.length}
                pageSize={5}
                visibleCount={groupTaskPage * 5}
                mode="loadMore"
                onLoadMore={() => setGroupTaskPage(p => p + 1)}
                onPageChange={() => {}}
                itemLabel="tugas tim"
                className="mt-2"
              />`
);

// Transactions
code = code.replace(
  /\.slice\(\(groupTxPage - 1\) \* 5, groupTxPage \* 5\)/,
  '.slice(0, groupTxPage * 5)'
);
code = code.replace(
  /<MobilePagination\s+currentPage=\{groupTxPage\}\s+totalItems=\{groupTransactions\.length\}\s+pageSize=\{5\}\s+onPageChange=\{setGroupTxPage\}\s+itemLabel="transaksi kas"\s+className="mt-2"\s+\/>/m,
  `<MobilePagination
                currentPage={1}
                totalItems={groupTransactions.length}
                pageSize={5}
                visibleCount={groupTxPage * 5}
                mode="loadMore"
                onLoadMore={() => setGroupTxPage(p => p + 1)}
                onPageChange={() => {}}
                itemLabel="transaksi kas"
                className="mt-2"
              />`
);

fs.writeFileSync('src/components/GroupDetailRoom.tsx', code);
