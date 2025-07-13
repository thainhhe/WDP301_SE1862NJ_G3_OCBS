import { useEffect, useState, useRef } from "react";
import { comboService } from "../../services/comboService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CATEGORY_LABELS = {
  popcorn: "Popcorn", drinks: "Drinks", snacks: "Snack", combo: "Other Combo"
};
const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "popcorn", label: "Popcorn" },
  { key: "drinks", label: "Drinks" },
  { key: "snacks", label: "Snack" },
  { key: "combo", label: "Other Combo" },
];

const PAGE_SIZE = 9;

const ComboSelector = ({ combos, setCombos }) => {
  const [comboList, setComboList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef();

  // Fetch combos from API with filter & search
  const fetchCombos = async (category, searchText) => {
    setLoading(true);
    const start = Date.now();
    let params = {};
    if (category && category !== "all") params.category = category;
    if (searchText) params.search = searchText;
    const data = await comboService.getCombos(params);
    // min loading 0.5s
    const elapsed = Date.now() - start;
    if (elapsed < 500) await new Promise(r => setTimeout(r, 500 - elapsed));
    setComboList(data);
    setLoading(false);
    setPage(1); // reset to first page on new fetch
  };

  // Debounce search & filter
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCombos(filter, search.trim());
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line
  }, [filter, search]);

  // Initial fetch
  useEffect(() => {
    fetchCombos(filter, search.trim());
    // eslint-disable-next-line
  }, []);

  const handleQuantityChange = (comboId, quantity, price) => {
    if (quantity < 0) return;
    const comboObj = comboList.find(c => c._id === comboId);
    const updated = combos.filter(c => c._id !== comboId);
    if (quantity > 0) {
      updated.push({
        _id: comboId,
        quantity,
        price,
        name: comboObj?.name,
        items: comboObj?.items || [],
      });
    }
    setCombos(updated);
  };

  // Pagination
  const totalPages = Math.ceil(comboList.length / PAGE_SIZE);
  const pagedCombos = comboList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Card className="mb-4 w-full border-none shadow-none">
      <CardContent className="p-0">
        <div className="flex gap-2 mb-2 flex-wrap mt-2">
          {CATEGORIES.map(cat => (
            <Button
              key={cat.key}
              size="sm"
              variant={filter === cat.key ? "default" : "outline"}
              className={filter === cat.key ? "bg-rose-600 text-white" : ""}
              onClick={() => setFilter(cat.key)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
        <div className="mb-2">
          <input
            type="text"
            placeholder="Search combo..."
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-rose-300"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="py-6 text-center text-gray-500">Loading combos...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full mt-3">
              {pagedCombos.map((combo) => {
                const selected = combos.find(c => c._id === combo._id)?.quantity || 0;
                return (
                  <div key={combo._id} className="flex bg-white rounded-lg shadow-sm border p-3 items-center gap-4 hover:shadow-md transition w-full mb-2">
                    <img
                      src={combo.image ? (combo.image.startsWith('http') ? combo.image : `http://localhost:5000/${combo.image.replace(/^\/+/, "")}`) : "/placeholder.svg?height=100&width=100"}
                      alt={combo.name}
                      className="w-20 h-20 object-cover rounded border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base truncate">{combo.name}</div>
                      <div className="text-sm text-gray-600 truncate mb-1">{combo.description}</div>
                      {combo.items && combo.items.length > 0 && (
                        <ul className="list-disc ml-5 text-xs text-gray-500 mb-1">
                          {combo.items.map((item, idx) => (
                            <li key={idx}>{item.quantity} {item.name}</li>
                          ))}
                        </ul>
                      )}
                      <div className="text-blue-600 font-bold mt-1">{combo.price.toLocaleString()} VND</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleQuantityChange(combo._id, selected + 1, combo.price)}>+</Button>
                      <span className="w-8 text-center font-semibold text-lg">{selected}</span>
                      <Button size="sm" variant="outline" onClick={() => handleQuantityChange(combo._id, selected - 1, combo.price)} disabled={selected === 0}>-</Button>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
                <span className="px-2 py-1 text-sm">Page {page} / {totalPages}</span>
                <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ComboSelector; 